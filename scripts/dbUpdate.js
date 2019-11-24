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
			`CREATE TABLE IF NOT EXISTS sounds_temp (
				id INTEGER PRIMARY KEY,
				filename TEXT NOT NULL UNIQUE,
				displayname TEXT DEFAULT NULL,
				source TEXT DEFAULT "no-source",
				count INTEGER NOT NULL DEFAULT 0,
				theme TEXT DEFAULT "megumin"
			);`,
			'INSERT INTO sounds_temp ( id, filename, displayname, source, count ) SELECT * FROM sounds;',
			'DROP TABLE sounds;',
			'ALTER TABLE sounds_temp RENAME TO sounds;',
			'UPDATE sounds SET filename = "kazuma_megumin" WHERE filename = "kazuma";',
			'UPDATE sounds SET theme = "megumin" WHERE theme IS NULL;',
			`INSERT INTO sounds ( filename, displayname, source, count, theme ) VALUES
			( "hikineet_aqua", "Shut-in NEET", "Season 1", 0, "aqua" ),
			( "godblow", "God Blow", "Season 1", 0, "aqua" ),
			( "godrequiem", "God Requiem", "Season 1", 0, "aqua" ),
			( "kazuma_aqua", "Kazuma", "Season 1", 0, "aqua" ),
			( "kazumasan", "Kazuma-san", "Season 1", 0, "aqua" ),
			( "sacredbreakspell", "Sacred Break Spell", "Season 1", 0, "aqua" ),
			( "purification", "Purification", "Season 1", 0, "aqua" ),
			( "turnundead", "Turn Undead", "Season 1", 0, "aqua" ),
			( "nomercy", "No mercy", "Season 1", 0, "darkness" ),
			( "whattodo", "What to do", "Season 1", 0, "darkness" ),
			( "kazuma_darkness", "Kazuma", "Season 1", 0, "darkness" ),
			( "useless", "She's useless", "Season 1", 0, "kazuma" ),
			( "hikineet_kazuma", "Shut-in NEET", "Season 1", 0, "kazuma" ),
			( "steal", "Steal", "Season 1", 0, "kazuma" ),
			( "thehell", "The hell's this?!", "Season 1", 0, "kazuma" ),
			( "createwater", "Create Water", "Season 1", 0, "kazuma" ),
			( "nice-explosion", "Nice explosion", "Season 1", 0, "kazuma" ),
			( "kazuma_kazuma", "Kazuma", "Season 1", 0, "kazuma" ),
			( "treasure", "Treasure", "Season 2", 0, "aqua" ),
			( "sacredexorcism", "Sacred Exorcism", "Season 2", 0, "aqua" ),
			( "forcefire", "Force Fire", "Season 2", 0, "aqua" ),
			( "snipe", "Snipe", "Season 2", 0, "kazuma" ),
			( "freeze", "Freeze", "Season 2", 0, "kazuma" ),
			( "lurk", "Lurk", "Season 2", 0, "kazuma" ),
			( "damnitall", "Damn it all!", "Season 2", 0, "kazuma" ),
			( "wahaha", "Wahaha", "Season 2", 0, "megumin" );
			`,
			'UPDATE sounds SET source = "no-source" WHERE source IS NULL;',
			'UPDATE sounds SET source = "no-source" WHERE source = "";',
			'UPDATE sounds SET displayname = NULL where filename = "realname";',
			'UPDATE sounds SET displayname = "Itai!" where filename = "itai";',
			'UPDATE sounds SET displayname = "Yamero!" where filename = "yamero";',
			`CREATE TABLE IF NOT EXISTS milestones (
				id INTEGER PRIMARY KEY,
				count INTEGER NOT NULL UNIQUE,
				reached INTEGER NOT NULL DEFAULT 0,
				timestamp INTEGER DEFAULT NULL,
				sound_id INTEGER DEFAULT NULL,
					FOREIGN KEY(sound_id) REFERENCES sounds(id) ON UPDATE CASCADE ON DELETE SET NULL
			);`,
			`CREATE TABLE IF NOT EXISTS statistics_temp (
				id INTEGER PRIMARY KEY,
				date TEXT NOT NULL UNIQUE,
				count INTEGER NOT NULL DEFAULT 0
			);`,
			'INSERT INTO statistics_temp SELECT * FROM statistics;',
			'DROP TABLE statistics;',
			'ALTER TABLE statistics_temp RENAME TO statistics;'
		]
	},
	{
		targetVersion: '8.1.0',
		queries: [
			`CREATE TABLE IF NOT EXISTS meta (
				version TEXT NOT NULL
			);`,
			'INSERT INTO meta ( version ) VALUES ( "8.1.0" );'
		]
	}
];

const { Database } = require('sqlite3');
const { join } = require('path');
const { createInterface } = require('readline');
const { copyFile } = require('fs');
const { databasePath } = require('../src/config.json');

const db = new Database(join('src', databasePath));
let currentVersion, newVersion, force;

const newVersionCLI = process.argv.filter(arg => arg.includes('newVersion='))[0];
const currentVersionCLI = process.argv.filter(arg => arg.includes('currentVersion='))[0];
const forceCLI = process.argv.filter(arg => arg.includes('--force'))[0];

if (newVersionCLI) newVersion = newVersionCLI.substr(newVersionCLI.indexOf('=') + 1).trim();
if (currentVersionCLI) currentVersion = currentVersionCLI.substr(currentVersionCLI.indexOf('=') + 1).trim();
if (forceCLI) force = true;

console.log('This is the megumin.love database migration tool.');
console.log('------------------------------------');
console.log('Creating database backup.');

copyFile(db.filename, `${db.filename}.bak`, err => {
	if (err) {
		console.log('Database backup creation failed, migration aborting.');
		return setTimeout(() => process.exit(1), 2000);
	}
});

db.get('SELECT version FROM meta', (selectErr, row) => {
	if (selectErr) {
		currentVersion = require('../package.json').version;
	}
	else {
		currentVersion = row.version;
	}

	console.log('------------------------------------');
	console.log(`Detected database version: ${currentVersion}`);

	if (!newVersion) promptNewVersion();
	else executeUpdateQueries();
});

function promptNewVersion() {
	const newVersionInput = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '\nTargeted database version (\'x.x.x\' or \'latest\'): '
	});

	newVersionInput.prompt();

	newVersionInput.on('line', ver => {
		newVersion = ver.trim();
		newVersionInput.close();

		executeUpdateQueries();
	});
}

function executeUpdateQueries() {
	if (newVersion === 'latest') newVersion = databaseVersions[databaseVersions.length - 1].targetVersion;

	if (currentVersion > newVersion && !force) {
		console.log('\nCurrent version is above new version. No updating is necessary.');
		return process.exit(0);
	}
	else if (currentVersion === newVersion && !force) {
		console.log('\nCurrent version equals new version. No updating is necessary.');
		return process.exit(0);
	}

	const upgrades = databaseVersions.filter(version => {
		const aboveCurrent = currentVersion < version.targetVersion;
		const belowNew = newVersion >= version.targetVersion;

		if (force) return currentVersion <= version.targetVersion;

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

	console.log('------------------------------------');
	console.log('Please review the above output for important notes and restore the created database backup if anything went wrong.');
}