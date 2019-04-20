const { Database } = require('sqlite3');
const { join } = require('path');
const { createInterface } = require('readline');
const { copyFile } = require('fs');
const { databasePath } = require('./src/config.json');

const db = new Database(join('src', databasePath));
let currentVersion, newVersion;

console.log('This is the megumin.love database migration tool.');
console.log('------------------------------------');
console.log('Creating database backup.');

copyFile(db.filename, `${db.filename}.bak`, err => {
	if (err) {
		console.log('Database backup creation failed, migration aborting.');
		return setTimeout(() => process.exit(1), 2000);
	}
});

db.get('SELECT version FROM meta', [], (selectErr, data) => {
	if (selectErr || !data || (data && !data.version)) currentVersion = 'Unknown';
	else currentVersion = data.version;

	console.log('------------------------------------');
	console.log(`Detected database version: ${currentVersion}`);

	if (currentVersion === 'Unknown') {
		console.log('\nPlease enter your version of megumin.love before the update (e.g. 6.0.2 or 7.1.0).');

		const currentVersionInput = createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'Starting database version: '
		});

		currentVersionInput.prompt();

		currentVersionInput.on('line', ver => {
			currentVersion = ver.trim();
			currentVersionInput.close();
		});

		currentVersionInput.on('close', () => targetDatabaseUpdate());
	}
	else targetDatabaseUpdate();
});

function targetDatabaseUpdate() {
	const newVersionInput = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '\nTargeted database version (\'x.x.x\' or \'latest\'): '
	});

	newVersionInput.prompt();

	newVersionInput.on('line', ver => {
		newVersion = ver.trim();

		if (newVersion === 'latest') newVersion = databaseVersions[databaseVersions.length - 1].targetVersion;

		if (currentVersion > newVersion) {
			console.log('\nCurrent version is above new version. No updating is necessary.');
			return process.exit(0);
		}
		else if (currentVersion === newVersion) {
			console.log('\nCurrent version equals new version. No updating is necessary.');
			return process.exit(0);
		}

		const upgrades = databaseVersions.filter(version => {
			const aboveCurrent = currentVersion < version.targetVersion;
			const belowNew = newVersion >= version.targetVersion;

			return aboveCurrent && belowNew;
			// Passes all versions above the current if the latest version is aspired
		});

		upgrades.forEach(version => {
			console.log('------------------------------------');
			console.log(`Running database queries required for version ${version.targetVersion}.`);

			const queries = version.queries.join(' ');

			db.exec(queries, err => {
				if (err) {
					console.log(`An error occurred while running the queries for version ${version.targetVersion}:`);
					console.log(err);
				}
			});

			if (version.notes) version.notes.forEach(note => console.log('Notice:', note));
			console.log(`Migration to version ${version.targetVersion} completed.`);
		});

		newVersionInput.close();

		console.log('------------------------------------');
		return console.log('Please review the above output for important notes and restore the created database backup if anything went wrong.');
	});
}

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
			'CREATE TABLE IF NOT EXISTS meta ( version TEXT NOT NULL );',
			'INSERT INTO meta ( version ) VALUES ( \'8.0.0\' );',
			`CREATE TABLE IF NOT EXISTS milestones (
				id INTEGER PRIMARY KEY,
				count INTEGER NOT NULL UNIQUE,
				achieved INTEGER NOT NULL,
				timestamp TEXT NOT NULL,
				soundID INTEGER,
					FOREIGN KEY(soundID) REFERENCES sounds(id) ON UPDATE CASCADE ON DELETE SET NULL
			);`
		]
	},
];