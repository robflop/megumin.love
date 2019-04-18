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

	db.run('ALTER TABLE sounds ADD COLUMN association TEXT', alterErr => {
		if (alterErr) return console.log('An error occurred adding the association column.');
	});
});