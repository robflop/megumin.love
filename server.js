const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const moment = require('moment');
const scheduler = require('node-schedule');
const config = require('./config.json');

let timestamp = moment().format('DD/MM/YYYY HH:mm:ss');

const db = new sqlite3.Database(config.databasePath);
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

http.listen(config.port, '', '', () => console.log(`[${timestamp}] Megumin.love running on port ${config.port}!${config.SSLproxy?" (Proxied to SSL)":""}`));
// info for self: listening using http because socket.io doesn't take an express instance (see socket.io docs)

const pagePath = path.join(__dirname, '/pages');
const errorPath = path.join(pagePath, '/errorTemplates');
const pages = [];

fs.readdirSync(pagePath).forEach(file => {
	const page = file.slice(0, -5).toLowerCase();
	if(file.substr(-5, 5) !== ".html" || config.errorTemplates.includes(page)) return;

	pages.push({
		name: file,
		path: path.join(pagePath, file),
		route: page === "index" ? "/" : "/" + page
	});
});

server.use(express.static('resources'));

let counter = 0, today = 0, week = 0, month = 0, average = 0, fetchedDaysAmount = 0;
const todayDate = moment().format('YYYY-MM-DD');

if(config.firstRun) {
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS yamero_counter ( counter INT NOT NULL )");
		db.run("INSERT INTO yamero_counter ( counter ) VALUES ('0')");

		db.run("CREATE TABLE IF NOT EXISTS statistics ( id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE, count INTEGER NOT NULL )");
		db.run("INSERT INTO statistics ( date, count ) VALUES ( date('now', 'localtime'), 0 )");
	}); // prepare the database on first run
	config.firstRun = false;
	fs.writeFileSync(`./config.json`, JSON.stringify(config, null, "\t"));
};

db.serialize(() => {
	db.get("SELECT counter FROM yamero_counter", [], (error, row) => {
		counter = row["counter"];
	});

	db.run(`INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date('now', 'localtime'), 0)`);
	// insert row for today with value 0 (or do nothing if exists)
	db.all("SELECT * FROM statistics WHERE date BETWEEN date('now', 'localtime', '-31 days') AND date('now', 'localtime')", [], (error, rows) => {
		today = rows.filter(row => { return row.date===todayDate })[0].count;
		const pastSevenDays = rows.filter(row => { return moment(row.date).diff(todayDate, 'days') < 7 });
		const pastThirtyOneDays = rows.filter(row => { return moment(row.date).diff(todayDate, 'days') < 31 });
		for(const date in pastSevenDays) {
			week += pastSevenDays[date].count;
		};
		for(const date in pastThirtyOneDays) {
			month += pastThirtyOneDays[date].count;
		};
		fetchedDaysAmount = pastThirtyOneDays.length;
		average = Math.round(month / pastThirtyOneDays.length);
	});
});

server.get('/conInfo', (req, res) => {
	res.send([config.port, config.SSLproxy]);
});

server.get('/counter', (req, res) => {
	if(req.query.statistics==="alltime") return res.send(`${counter}`);
	if(req.query.statistics==="today") return res.send(`${today}`);
	if(req.query.statistics==="week") return res.send(`${week}`);
	if(req.query.statistics==="month") return res.send(`${month}`);
	if(req.query.statistics==="average") return res.send(`${average}`);
	if(req.query.inc) counter++;
	res.send(`${counter}`);
});

io.on('connection', (socket) => {
	socket.on('click', (data) => {
		counter++; today++; week++; month++;
		average = Math.round(month / fetchedDaysAmount);
		io.sockets.emit('update', {counter: counter, statistics: {alltime: counter, today: today, week: week, month: month, average: average}});
	});
});

for(const page of pages) {
	server.get(page.route, (req, res) => res.sendFile(page.path));
	server.get(`${page.route}.html`, (req, res) => res.redirect(page.route));
};

for(const error of config.errorTemplates) {
	server.use((req, res) => res.status(error).sendFile(`${errorPath}/${error}.html`))
};

// database updates
scheduler.scheduleJob(`*/${Math.round(config.updateInterval)} * * * *`, () => {
	timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	db.serialize(() => {
		db.run("UPDATE yamero_counter SET `counter` ="+counter);
		db.run(`UPDATE statistics SET count = ${today} WHERE date = date('now', 'localtime'); INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( ${todayDate}, ${today} );`);
		console.log(`[${timestamp}] Database updated.`);
	});
}); // update db at the configured minute of each hour
scheduler.scheduleJob('0 0 1 * *', () => {
	timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	month = 0; fetchedDaysAmount = 0;
	io.sockets.emit('update', {counter: counter, statistics: {alltime: counter, today: today, week: week, month: month, average: average}});
	console.log(`[${timestamp}] Monthly counter & fetched days amount reset.`);
}); // reset monthly counter at the start of the month
scheduler.scheduleJob('0 0 * * 1', () => {
	timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	week = 0;
	io.sockets.emit('update', {counter: counter, statistics: {alltime: counter, today: today, week: week, month: month, average: average}});
	console.log(`[${timestamp}] Weekly counter reset.`);
}); // reset weekly counter at the start of the week (1=monday)
scheduler.scheduleJob('0 0 * * *', () => {
	timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	today = 0; fetchedDaysAmount++;
	average = Math.round(month / fetchedDaysAmount);
	io.sockets.emit('update', {counter: counter, statistics: {alltime: counter, today: today, week: week, month: month, average: average}});
	console.log(`[${timestamp}] Daily counter reset & fetched days amount incremented.`);
}); // reset daily counter at midnight