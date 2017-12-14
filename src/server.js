const express = require('express');
const moment = require('moment');
const Logger = require('./resources/js/Logger');
const { join } = require('path');
const { readdirSync } = require('fs');
const { Database } = require('sqlite3');
const { scheduleJob } = require('node-schedule');
const config = require('./config.json');
const sounds = require('./resources/js/sounds');

const bootDate = moment().format('YYYY-MM-DD');
const startOfBootWeek = moment().startOf('week').add(1, 'days'), endOfBootWeek = moment().endOf('week').add(1, 'days');
// add 1 day because moment sees sunday as start and saturday as end of week and i don't
const startOfBootMonth = moment().startOf('month'), endOfBootMonth = moment().endOf('month');

let counter = 0, daily = 0, weekly = 0, monthly = 0, average = 0, fetchedDaysAmount = 1;

const statistics = new Map(); // eslint-disable-line no-undef

const soundQueryValues = sounds.map(sound => `( '${sound.filename}', 0 )`);
let rankings = [];

function bubbleSort(arr, property) {
	let sorted = arr.length;
	do {
		for (let i = 1; i < sorted; ++i) {
			const a = property ? arr[i - 1][property] : arr[i - 1];
			const b = property ? arr[i][property] : arr[i];

			if (a < b) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
		}
		--sorted;
	} while (sorted > 0);

	return arr;
}
/*
bubble sort used to avoid ranking entries of the same count continuously swapping positions,
since Array.sort() isn't a stable sort -- before bubble sorting it's sorted once already, so
bubble sorting only does minimal work and therefore doesn't really slow down.
*/

// on-boot database interaction

const db = new Database(config.databasePath);

db.serialize(() => {
	db.run('CREATE TABLE IF NOT EXISTS yamero_counter ( counter INT NOT NULL )');

	db.run('CREATE TABLE IF NOT EXISTS statistics ( id INTEGER PRIMARY KEY, date TEXT NOT NULL UNIQUE, count INTEGER NOT NULL )');
	db.run('INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date( \'now\', \'localtime\'), 0 )');

	db.run('CREATE TABLE IF NOT EXISTS rankings ( id INTEGER PRIMARY KEY, filename TEXT NOT NULL UNIQUE, count INTEGER NOT NULL )');
	db.run(`INSERT OR IGNORE INTO rankings ( filename, count ) VALUES ${soundQueryValues}`);

	// make sure all necessary tables with at least one necessary column exist

	db.get('SELECT counter FROM yamero_counter', [], (error, row) => {
		if (!row) db.run(`INSERT OR IGNORE INTO yamero_counter ( counter ) VALUES ( 0 )`);
		// create row if it doesn't exist
		counter = row ? row.counter : 0;

		return Logger.info('Main counter loaded.');
	});

	db.all('SELECT * FROM statistics', [], (error, rows) => {
		daily = rows.find(row => row.date === bootDate).count;
		const thisWeek = rows.filter(row => moment(row.date).isBetween(startOfBootWeek, endOfBootWeek, null, []));
		const thisMonth = rows.filter(row => moment(row.date).isBetween(startOfBootMonth, endOfBootMonth, null, []));
		// null & [] parameters given for including first and last day of range (see moment docs)

		rows.map(date => statistics.set(date.date, date.count));
		// populate statistics map
		weekly = thisWeek.reduce((total, date) => total += date.count, 0);
		monthly = thisMonth.reduce((total, date) => total += date.count, 0);

		fetchedDaysAmount = thisMonth.length;
		average = Math.round(monthly / thisMonth.length);

		return Logger.info('Statistics loaded.');
	});

	db.all('SELECT * FROM rankings', [], (error, rows) => {
		rows = rows.sort((a, b) => b.count - a.count);

		rows.map(sound => {
			const sbSound = sounds.find(s => sound.filename === s.filename);
			if (!sbSound) return Logger.warn(`'${sound.filename}' sound found in database but not locally, skipping sound...`);

			return rankings.push(Object.assign(sbSound, { count: sound.count }));
		});

		return Logger.info('Rankings loaded.');
	});
});

// webserver

const server = express();
const http = require('http').Server(server);
const maintenanceMode = (process.argv.slice(2)[0] || '') === '--maintenance' ? true : false; // eslint-disable-line no-unneeded-ternary
const dateRegex = new RegExp(/^(\d{4})-(\d{2})-(\d{2})$/);

const pagePath = join(__dirname, '/pages');
const errorPath = join(pagePath, '/errorTemplates');
const pages = [];

readdirSync(pagePath).forEach(file => {
	const page = file.slice(0, -5).toLowerCase();
	if (file.substr(-5, 5) !== '.html' || config.errorTemplates.includes(page)) return;

	pages.push({
		name: file,
		path: join(pagePath, file),
		route: [`/${page}`, `/${page}.html`]
	});

	if (page === 'index') pages[pages.length - 1].route.push('/');
	// last array item because during current iteration it will be the last (adds root-dir route for index)
});

server.use(express.static('./resources'));

http.listen(config.port, () => {
	const options = `${config.SSLproxy ? ' (Proxied to SSL)' : ''}${maintenanceMode ? ' (in Maintenance mode!)' : ''}`;

	return Logger.info(`megumin.love booting on port ${config.port}...${options}`);
});

server.get('/conInfo', (req, res) => res.json({ port: config.port, ssl: config.SSLproxy }));

server.get('/counter', (req, res) => {
	if (req.query.statistics === '') {
		return res.json({
			alltime: counter,
			daily,
			weekly,
			monthly,
			average
		});
	}

	if (req.query.rankings === '') return res.json(rankings);

	if (req.query.inc) ++counter;

	return res.send(counter.toString());
});

server.get('/stats', (req, res) => {
	const requestedStats = {};
	if (req.query.from || req.query.to) {
		if ((req.query.from && !dateRegex.test(req.query.from)) || (req.query.to && !dateRegex.test(req.query.to))) {
			return res.status(400).json({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in YYYY-MM-DD format.' });
		}

		if (req.query.from && !req.query.to) {
			return res.json({ [req.query.from]: statistics.get(req.query.from) || 0 });
		}
		else if (!req.query.from && req.query.to) {
			const to = moment(req.query.to);

			statistics.forEach((count, date) => {
				if (moment(date).isSameOrBefore(to)) requestedStats[date] = count;
			});

			return res.json(requestedStats || {});
		}
		else if (req.query.from && req.query.to) {
			const from = moment(req.query.from), to = moment(req.query.to);

			statistics.forEach((count, date) => {
				if (moment(date).isBetween(from, to, null, [])) requestedStats[date] = count;
				// null & [] parameters given for including first and last day of range (see moment docs)
			});

			return res.json(requestedStats || {});
		}
	}
	else {
		statistics.forEach((count, date) => requestedStats[date] = count);

		return res.json(requestedStats);
	}
});

if (!maintenanceMode) {
	for (const page of pages) {
		server.get(page.route, (req, res) => res.sendFile(page.path));
	}
}

server.get('/version', (req, res) => res.redirect('/versions'));
// only doing this because the old name is still cached, probs remove this somewhen in the future

for (const error of config.errorTemplates) {
	if (maintenanceMode) {
		return server.get(/.*/, (req, res) => res.status(503).sendFile('503.html', { root: './pages/errorTemplates/' }));
	}
	else {
		server.use((req, res) => res.status(error).sendFile(`${error}.html`, { root: './pages/errorTemplates/' }));
	}
}

// socket server

const uws = require('uws');
const socketServer = new uws.Server({ server: http });
const sockets = new Set();

function emitUpdate(types) {
	const values = {
		counter: types.includes('counter') ? counter : null,
		statistics: types.includes('statistics') ? { alltime: counter, daily, weekly, monthly, average } : null,
		rankings: types.includes('rankings') ? rankings : null
	};

	return sockets.forEach(socket => socket.send(JSON.stringify({ type: 'update', values })));
}

socketServer.on('connection', socket => {
	sockets.add(socket);

	socket.pingInterval = setInterval(() => socket.ping(), 1000 * 45);

	socket.on('message', message => {
		let data;

		try {
			data = JSON.parse(message);
		}
		catch (e) {
			data = {};
		}

		if (!['click', 'sbClick'].includes(data.type)) return;

		if (data.type === 'click') {
			const currentDate = moment().format('YYYY-MM-DD');
			++counter; ++daily;
			++weekly; ++monthly;
			average = Math.round(monthly / fetchedDaysAmount);

			statistics.set(currentDate, daily);

			return emitUpdate(['counter', 'statistics']);
		}

		if (data.type === 'sbClick') {
			if (!data.sound) return;

			let rankingsEntry = rankings.find(rank => rank.filename === data.sound.filename);

			if (!rankingsEntry && !sounds.find(s => data.sound.filename === s.filename)) return;
			// safeguard against requests with sounds that don't exist from being saved serverside
			// no need to check other props because if it's found, only count will be incremented (no user input)

			if (rankingsEntry) ++rankingsEntry.count;
			else rankingsEntry = Object.assign(data.sound, { count: 1 });

			rankings = bubbleSort(rankings, 'count');

			return emitUpdate(['rankings']);
		}
	});

	socket.on('close', (code, reason) => {
		clearInterval(socket.pingInterval);
		sockets.delete(socket);
	});
});

// database updates

scheduleJob(`*/${Math.round(config.updateInterval)} * * * *`, () => {
	db.serialize(() => {
		db.run(`UPDATE yamero_counter SET \`counter\` = ${counter}`);

		db.run(`INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date('now', 'localtime'), ${daily} )`);
		db.run(`UPDATE statistics SET count = ${daily} WHERE date = date('now', 'localtime')`);

		for (const sound of rankings) {
			db.run(`UPDATE rankings SET count = ${sound.count} WHERE filename = '${sound.filename}'`);
		}
	});

	return Logger.info('Database updated.');
}); // update db at every n-th minute

scheduleJob('0 0 1 * *', () => {
	monthly = 0; fetchedDaysAmount = 1;

	Logger.info('Monthly counter & fetched days amount reset.');

	return emitUpdate(['statistics']);
}); // reset monthly counter at the start of each month

scheduleJob('0 0 * * 1', () => {
	weekly = 0;

	Logger.info('Weekly counter reset.');

	return emitUpdate(['statistics']);
}); // reset weekly counter at the start of each week (1 = monday)

scheduleJob('0 0 * * *', () => {
	daily = 0; ++fetchedDaysAmount;
	average = Math.round(monthly / fetchedDaysAmount);
	statistics.set(moment().format('YYYY-MM-DD'), 0);

	Logger.info('Daily counter reset & fetched days amount incremented.');

	return emitUpdate(['statistics']);
}); // reset daily counter and update local statistics map at each midnight