const { Database } = require('sqlite3');
const { join } = require('path');
const { copyFile } = require('fs');
const { databasePath } = require('../src/config.json');

const db = new Database(join('..', 'src', databasePath));

console.log('Database adjustment now in progress. Do not manually exit or your database will get corrupted and not work again.');
console.log('Once this is complete you may run the website as usual again.');
console.log('(It is complete once the command line input shows up again.)');

copyFile(db.filename, `${db.filename}.bak`, err => {
	if (err) return console.log('Database backup creation failed, migration aborting.');
	console.log('Database backup created.');

	db.serialize(() => {
		db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="yamero_counter"', [], (error, tableNameRow) => {
			if (tableNameRow) return db.run('ALTER TABLE yamero_counter RENAME TO main_counter');
			else return console.log('"yamero_counter" table not found, did you already migrate?');
		});
	});
});