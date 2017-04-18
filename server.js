const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const moment = require('moment');
const config = require('./config.json');

const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');

const db = new sqlite3.Database(config.databasePath);
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

http.listen(config.port, '', '', () => console.log(`[${timestamp}] Megumin.love running on port ${config.port}!`));
// info for self: listening using http because socket.io doesn't take an express instance (see socket.io docs)

const pagePath = path.join(__dirname, '/pages');
const errorPath = path.join(pagePath, '/errorTemplates');
const pages = [];

fs.readdirSync(pagePath).forEach(file => {
	let page = file.slice(0, -5).toLowerCase();
	if(file.substr(-5, 5) !== ".html" || config.errorTemplates.includes(page)) return;

	pages.push({
		name: file,
		path: path.join(pagePath, file),
		route: page === "index" ? "/" : "/" + page
	});
});

server.use(express.static('resources'));

var counter = 0, today = 0, week = 0, month = 0, average = 0;
var todayDate = moment().format('YYYY-MM-DD');

if(config.firstRun) {
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS yamero_counter ( counter INT NOT NULL )");
		db.run("INSERT INTO yamero_counter ( counter ) VALUES ('0')");

		db.run("CREATE TABLE IF NOT EXISTS statistics ( id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE, count INTEGER NOT NULL )");
		db.run("INSERT INTO statistics ( date, count ) VALUES ( date('now'), 0 )");
	}); // prepare the database on first run
	config.firstRun = false;
	fs.writeFileSync(`./config.json`, JSON.stringify(config, null, "\t"));
};

db.get("SELECT counter FROM yamero_counter", [], (error, row) => {
	counter = row["counter"];
});

db.all("SELECT * FROM statistics WHERE date BETWEEN date('now','-31 days') AND date('now')", [], (error, rows) => {
	today = rows.filter(row => { return row.date===todayDate })[0].count;
	pastSevenDays = rows.filter(row => { return moment(row.date).diff(todayDate, 'days') < 7 });
	pastThirtyOneDays = rows.filter(row => { return moment(row.date).diff(todayDate, 'days') < 31 });
	for(let date in pastSevenDays) {
		week += pastSevenDays[date].count;
	};
	for(let date in pastThirtyOneDays) {
		month += pastThirtyOneDays[date].count;
	};
	monthly = pastThirtyOneDays.length;
	average = Math.round(month / pastThirtyOneDays.length);
});

const updateDB = () => {
	const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
	db.serialize(() => {
		db.run("UPDATE yamero_counter SET `counter` ="+counter);
		db.run(`UPDATE statistics SET count = ${today} WHERE date = date('now'); INSERT INTO statistics ( date, count ) (SELECT ${todayDate}, ${today}) WHERE (SELECT Changes() = 0)`)
		console.log(`[${timestamp}] Database updated.`);
	});
};

server.get('/port', (req, res) => {
	res.send(`${config.port}`);
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
		average = Math.round(month / monthly);
		io.sockets.emit('update', {counter: counter, statistics: {alltime: counter, today: today, week: week, month: month, average: average}});
	});
});

for(let page of pages) {
	server.get(page.route, (req, res) => res.sendFile(page.path));
};

for(let error of config.errorTemplates) {
	server.use((req, res) => res.status(error).sendFile(`${errorPath}/${error}.html`))
};

setInterval(() => { updateDB(); }, 1000*60*config.updateInterval); // update sql every 30min
