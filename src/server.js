/* eslint-env node */

const express = require('express');
const moment = require('moment');
const { join } = require('path');
const { readdirSync, writeFileSync } = require('fs');
const { Database } = require('sqlite3');
const { scheduleJob } = require('node-schedule');
const config = require('./config.json');

function currentTime() {
	return moment().format('DD/MM/YYYY HH:mm:ss');
}

function emitUpdate() {
	return io.sockets.emit('update', {
		counter,
		statistics: { alltime: counter, today, week, month, average }
	});
}

const db = new Database(config.databasePath);
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

http.listen(config.port, () => {
	console.log(`[${currentTime()}] Megumin.love running on port ${config.port}!${config.SSLproxy ? ' (Proxied to SSL)' : ''}`);
}); // info for self: listening using http because socket.io doesn't take an express instance (see socket.io docs)

const pagePath = join(__dirname, '/pages');
const errorPath = join(pagePath, '/errorTemplates');
const pages = [];

readdirSync(pagePath).forEach(file => {
	const page = file.slice(0, -5).toLowerCase();
	if (file.substr(-5, 5) !== '.html' || config.errorTemplates.includes(page)) return;

	return pages.push({
		name: file,
		path: join(pagePath, file),
		route: page === 'index' ? '/' : `/${page}`
	});
});

server.use(express.static('resources'));

let counter = 0, today = 0, week = 0, month = 0, average = 0, fetchedDaysAmount = 1;
const bootDate = moment().format('YYYY-MM-DD');
const startOfWeek = moment().startOf('week').add(1, 'days'), endOfWeek = moment().endOf('week').add(1, 'days');
// add 1 day because moment sees sunday as start and saturday as end of week and i don't
const startOfMonth = moment().startOf('month'), endOfMonth = moment().endOf('month');
const statistics = new Map(); // eslint-disable-line no-undef
const dateRegex = new RegExp(/^(\d{4})-(\d{2})-(\d{2})$/);

if (config.firstRun) {
	db.serialize(() => {
		db.run('CREATE TABLE IF NOT EXISTS yamero_counter ( counter INT NOT NULL )');
		db.run('INSERT INTO yamero_counter ( counter ) VALUES ( 0 )');

		db.run('CREATE TABLE IF NOT EXISTS statistics ( id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE, count INTEGER NOT NULL )');
		db.run('INSERT INTO statistics ( date, count ) VALUES ( date(\'now\', \'localtime\'), 0 )');
	}); // prepare the database on first run

	config.firstRun = false;
	writeFileSync(`./config.json`, JSON.stringify(config, null, '\t'));
}

db.serialize(() => {
	db.get('SELECT counter FROM yamero_counter', [], (error, row) => {
		counter = row.counter;
	});

	db.run('INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date( \'now\', \'localtime\'), 0)');
	// insert row for today with value 0 (or do nothing if exists)

	db.all('SELECT * FROM statistics', [], (error, rows) => {
		today = rows.filter(row => row.date === bootDate)[0].count;
		const thisWeek = rows.filter(row => moment(row.date).isBetween(startOfWeek, endOfWeek, null, []));
		const thisMonth = rows.filter(row => moment(row.date).isBetween(startOfMonth, endOfMonth, null, []));
		// null & [] parameters given for including first and last day of range (see moment docs)

		rows.map(date => statistics.set(date.date, date.count));
		// populate statistics map
		week = thisWeek.reduce((total, date) => total += date.count, 0);
		month = thisMonth.reduce((total, date) => total += date.count, 0);

		fetchedDaysAmount = thisMonth.length;
		average = Math.round(month / thisMonth.length);
	});
});

server.get('/conInfo', (req, res) => res.send({ port: config.port, ssl: config.SSLproxy }));

server.get('/counter', (req, res) => {
	if (req.query.statistics === '') {
		return res.send({
			alltime: counter,
			today,
			week,
			month,
			average
		});
	}

	if (req.query.inc) counter++;

	return res.send(`${counter}`); // template string because a number gets interpreted as status code
});

server.get('/stats', (req, res) => {
	const requestedStats = {};
	if (req.query.from || req.query.to) {
		if ((req.query.from && !dateRegex.test(req.query.from)) || (req.query.to && !dateRegex.test(req.query.to))) {
			return res.status(400).send({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in YYYY-MM-DD format.' });
		}

		if (req.query.from && !req.query.to) {
			return res.send({ [req.query.from]: statistics.get(req.query.from) || 0 });
		}
		else if (!req.query.from && req.query.to) {
			const to = moment(req.query.to);

			statistics.forEach((count, date) => {
				if (moment(date).isSameOrBefore(to)) requestedStats[date] = count;
			});

			return res.send(requestedStats || {});
		}
		else if (req.query.from && req.query.to) {
			const from = moment(req.query.from), to = moment(req.query.to);

			statistics.forEach((count, date) => {
				if (moment(date).isBetween(from, to, null, [])) requestedStats[date] = count;
				// null & [] parameters given for including first and last day of range (see moment docs)
			});

			return res.send(requestedStats || {});
		}
	}
	else {
		statistics.forEach((count, date) => requestedStats[date] = count);

		return res.send(requestedStats);
	}
});

io.on('connection', socket => {
	socket.on('click', () => {
		const todayDate = moment().format('YYYY-MM-DD');
		counter++; today++;
		week++; month++;
		average = Math.round(month / fetchedDaysAmount);

		statistics.set(todayDate, today);

		return emitUpdate();
	});
});

for (const page of pages) {
	server.get(page.route, (req, res) => res.sendFile(page.path));
	server.get(`${page.route}.html`, (req, res) => res.redirect(page.route));
}

for (const error of config.errorTemplates) {
	server.use((req, res) => res.status(error).sendFile(`${errorPath}/${error}.html`));
}

// database updates below

scheduleJob(`*/${Math.round(config.updateInterval)} * * * *`, () => {
	console.log(`[${currentTime()}] Database updated.`);
	return db.serialize(() => {
		db.run(`UPDATE yamero_counter SET \`counter\` = ${counter}`);
		db.run(`INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date('now', 'localtime'), ${today} )`);
		db.run(`UPDATE statistics SET count = ${today} WHERE date = date('now', 'localtime')`);
	});
}); // update db at every xth minute

scheduleJob('0 0 1 * *', () => {
	month = 0; fetchedDaysAmount = 1;
	console.log(`[${currentTime()}] Monthly counter & fetched days amount reset.`);
	return emitUpdate();
}); // reset monthly counter at the start of the month

scheduleJob('0 0 * * 1', () => {
	week = 0;
	console.log(`[${currentTime()}] Weekly counter reset.`);
	return emitUpdate();
}); // reset weekly counter at the start of the week (1 = monday)

scheduleJob('0 0 * * *', () => {
	today = 0; fetchedDaysAmount++;
	average = Math.round(month / fetchedDaysAmount);
	statistics.set(moment().format('YYYY-MM-DD'), 0);
	console.log(`[${currentTime()}] Daily counter reset & fetched days amount incremented.`);
	return emitUpdate();
}); // reset daily counter and update local statistics map at midnight