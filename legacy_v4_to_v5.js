const { Database } = require('sqlite3');
const { join } = require('path');
const { copyFile } = require('fs');
const { databasePath } = require('./src/config.json');
let sounds;

try {
	sounds = require('./src/resources/js/sounds');
}
catch (e) {
	console.log('The sounds.js file could not be found! Did you already migrate?');
	return console.log(e.message);
}

const db = new Database(join('.', 'src', databasePath));
const soundQueryValues = sounds.map(sound => `( "${sound.filename}", "${sound.displayName}", "${sound.source}", 0 )`);

console.log('Database adjustment now in progress. Do not manually exit or your database will get corrupted and not work again.');
console.log('Once this is complete you may delete the "sounds.js" file located at "/src/resources/sounds.js"');
console.log('(It is complete once the command line input shows up again.)');

copyFile(db.filename, `${db.filename}.bak`, err => {
	if (err) return console.log('Database backup creation failed, migration aborting.');
	console.log('Database backup created. Restore this if something goes wrong.');

	db.serialize(() => {
		db.run(`
		CREATE TABLE IF NOT EXISTS sounds (
			id INTEGER PRIMARY KEY,
			filename TEXT NOT NULL UNIQUE,
			displayname TEXT NOT NULL,
			source TEXT NOT NULL,
			count INTEGER NOT NULL
		)
		`);

		db.run(`INSERT OR IGNORE INTO sounds ( filename, displayname, source, count ) VALUES ${soundQueryValues}`);

		db.all('SELECT filename, count FROM rankings', [], (error, rows) => {
			if (error) return console.log('An error occurred accessing v4-specific database values (v5+ does not have these), did you already migrate?');

			db.serialize(() => {
				for (const row of rows) {
					db.run(`UPDATE sounds SET count = ${row.count} WHERE filename = '${row.filename}'`);
				}
				db.run('DROP TABLE rankings');
			});
		});
	});
});