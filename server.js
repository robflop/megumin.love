const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const config = require('./config.js');

const db = new sqlite3.Database(config.databasePath);
const server = express();
const http = require('http').Server(server);
const io = require('socket.io')(http);

http.listen(config.port, '', '', () => console.log(`Megumin.love running on port ${config.port}!`));
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

var counter;

db.get("SELECT counter FROM yamero_counter", [], (error, row) => {
	counter = row["counter"];
});

server.get('/counter', (req, res) => {
	res.send(`${counter}`);
});

io.on('connection', (socket) => {
	socket.on('click', (data) => {
		counter += data.count;
		io.sockets.emit('update', {counter: counter});
	});
});

for(let page of pages) {
	server.get(page.route, (req, res) => res.sendFile(page.path));
};

for(let error of config.errorTemplates) {
	server.use((req, res) => res.status(error).sendFile(`${errorPath}/${error}.html`))
};

setInterval(() => { db.get("UPDATE yamero_counter SET `counter` ="+counter); }, 1000*60*config.updateInterval); // update sql every 30min