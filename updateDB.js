const { Database } = require('sqlite3');
const config = require('./src/config.json');
const sounds = require('./src/resources/js/sounds');
const { join } = require('path');

const db = new Database(join('src', config.databasePath));
const soundQueryValues = sounds.map(sound => `( "${sound.filename}", "${sound.displayName}", "${sound.source}", 0 )`);

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

	db.all('SELECT * FROM rankings', [], (error, rows) => {
		if (error) return console.log('Error during migration, did you already migrate?');
		db.serialize(() => {
			for (const row of rows) {
				db.run(`UPDATE sounds SET count = ${row.count} WHERE filename = '${row.filename}'`);
			}
			db.run('DROP TABLE rankings');
			console.log('Database adjustment in progress. Once this is complete you may delete your "sounds.js" file at "/src/resources/sounds.js".');
			console.log('(It is complete once the command line input shows up again.)');
		});
	});
});