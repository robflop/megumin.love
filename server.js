const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const config = require('./config.js');
const db = new sqlite3.Database(config.databasePath);
const server = express();

server.use(express.static('resources'));

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

server.get('/counter', (req, res) => {
	db.get("SELECT counter FROM yamero_counter", [], (error, row) => {
		res.send(`${row["counter"]}`);
	});
});

server.get('/increment', (req, res) => {
	db.get("SELECT counter FROM yamero_counter", [], (error, row) => {
		counter = row["counter"] + 1;
		db.get("UPDATE yamero_counter SET `counter` = " + counter, [], (error, row) => {
		});
	});
	res.send('');
});

for(let page of pages) {
	server.get(page.route, (req, res) => res.sendFile(page.path));
};

for(let error of config.errorTemplates) {
	server.use((req, res) => res.status(error).sendFile(`${errorPath}/${error}.html`))
};

server.listen(config.port, () => console.log(`Megumin.love running on port ${config.port}!`));