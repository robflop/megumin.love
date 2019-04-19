const { Database } = require('sqlite3');
const { join } = require('path');
const { createInterface } = require('readline');
const { copyFile } = require('fs');
const { databasePath } = require('./src/config.json');

const db = new Database(join('src', databasePath));
let dbVersion, newVersion;

const databaseVersions = [
	{
		targetVersion: '6.0.0',
		queries: [
			'ALTER TABLE yamero_counter RENAME TO main_counter;',
		]
	},
	{
		targetVersion: '7.0.2',
		queries: [
			'UPDATE sounds SET filename = "objection", displayname = "Objection!!" WHERE filename = "igiari";',
		],
		notes: [
			'Rename \'igiari.mp3\' in the sounds folder to \'objection.mp3\' or the sound will not work on-site anymore.'
		]
	},
	{
		targetVersion: '8.0.0',
		queries: [
			'ALTER TABLE sounds ADD COLUMN association TEXT;',
			'CREATE TABLE IF NOT EXISTS meta ( dbVersion TEXT NOT NULL );',
			'INSERT INTO meta ( dbVersion ) VALUES ( \'8.0.0\' );'
		]
	},
];

function targetDatabaseUpdate() {
	const migrationVersionInput = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: 'Targeted database version: '
	});

	migrationVersionInput.prompt();

	migrationVersionInput.on('line', ver => {
		console.log('------------------------------------');
		newVersion = ver.trim();

		databaseVersions.forEach(version => {
			if (dbVersion < version.targetVersion && newVersion >= version.targetVersion) {
				console.log(`Running database queries required for version ${version.targetVersion}.`);

				const queries = version.queries.join(' ');

				db.exec(queries, err => {
					if (err) {
						console.log('An error occurred while running the relevant queries:');
						console.log(err);
					}
				});

				if (version.notes) version.notes.forEach(note => console.log('Notice:', note));
				console.log(`Migration to version ${version.targetVersion} completed.`);
				console.log('------------------------------------');
			}
		});

		migrationVersionInput.close();

		copyFile(db.filename, `${db.filename}.bak`, err => {
			if (err) {
				console.log('\nDatabase backup creation failed, migration aborting.');
				return setTimeout(() => process.exit(1), 2000);
			}
			console.log('Restore the created database backup if anything went wrong.');
		});
	});
}

db.get('SELECT dbVersion FROM meta', [], (selectErr, data) => {
	if (selectErr || !data || (data && !data.dbVersion)) dbVersion = 'Unknown';
	else dbVersion = data.dbVersion;

	console.log('This is the megumin.love database migration tool.');
	console.log(`Detected database version: ${dbVersion}`);

	if (dbVersion === 'Unknown') {
		console.log('Please enter your version of megumin.love before the update (e.g. 6.0.2 or 7.1.0):');

		const dbVersionInput = createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'Starting database version: '
		});

		dbVersionInput.prompt();

		dbVersionInput.on('line', ver => {
			dbVersion = ver.trim();
			dbVersionInput.close();
		});

		dbVersionInput.on('close', () => targetDatabaseUpdate());
	}
	else targetDatabaseUpdate();
});