const { Database } = require('sqlite3');
const { join } = require('path');
const { copyFile, unlink } = require('fs');
const config = require('./src/config.json');

const defaultDB = new Database('./src/db/default.db');
const actualDB = new Database(join('src', config.databasePath));

function randomString(n) {
	let r = '';
	while (n--) {
		r += String.fromCharCode((r = Math.random() * 62 | 0, r += r > 9 ? r < 36 ? 55 : 61 : 48));
	}
	return r;
}

copyFile(actualDB.filename, `${actualDB.filename}.bak`, err => {
	if (err) return console.log('Backup creation failed, script aborting.');

	console.log('Database backup created.');
	console.log('Adjustment in progress. Do not manually exit or things will break.');
	console.log('(It is complete once the command line input shows up again.)');
	actualDB.all('SELECT * FROM sounds', (err, actualRows) => {
		if (err) return console.log(err);

		actualDB.serialize(() => {
			// need to drop and re-create because sqlite can't alter to add an unique column

			actualDB.run('DROP TABLE IF EXISTS sounds');

			actualDB.run(`
						CREATE TABLE IF NOT EXISTS sounds ( 
							id INTEGER PRIMARY KEY, 
							filename TEXT NOT NULL UNIQUE, 
							displayname TEXT NOT NULL, 
							source TEXT NOT NULL, 
							count INTEGER NOT NULL,
							soundID TEXT NOT NULL UNIQUE
						)
						`);

			defaultDB.all('SELECT * FROM sounds', (err, defaultRows) => {
				// query default db which has the sound IDs
				if (err) return console.log(err);

				actualRows = actualRows.map((sound, index) => {
					const soundID = defaultRows[sound.id - 1] ? defaultRows[sound.id - 1].soundID : randomString(10);
					// carry over sound ID from default DB if sound exists in default and user DB, generate new ID if it's only in user DB
					return `(${sound.id}, "${sound.filename}", "${sound.displayname}", "${sound.source}", ${sound.count}, "${soundID}" )`;
					// prepare formatted values for query below
				});

				actualDB.run(`INSERT OR IGNORE INTO sounds ( id, filename, displayname, source, count, soundID ) VALUES ${actualRows}`);
			});
		});
	});
});