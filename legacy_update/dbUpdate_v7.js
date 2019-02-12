const { Database } = require('sqlite3');
const { join } = require('path');
const { copyFile, rename } = require('fs');
const { databasePath } = require('../src/config.json');

const db = new Database(join('..', 'src', databasePath));

console.log('Database adjustment now in progress. Do not manually exit or your database will get corrupted and not work again.');
console.log('Once this is complete you may run the website as usual again.');
console.log('(It is complete once the command line input shows up again.)');

copyFile(db.filename, `${db.filename}.bak`, err => {
	if (err) return console.log('Database backup creation failed, migration aborting.');
	console.log('Database backup created. Restore this if something goes wrong.');

	db.run('UPDATE sounds SET filename = "objection", displayname = "Objection!!" WHERE filename = "igiari"', updateErr => {
		if (updateErr) return console.log('An error occurred renaming the igiari database entry. Has it already been renamed or does it not exist?');
	});

	rename('../src/resources/sounds/igiari.mp3', '../src/resources/sounds/objection.mp3', renameErr => {
		if (renameErr) return console.log('An error occurred renaming the igiari soundfile. Has it already been renamed or does it not exist?');
	});
});