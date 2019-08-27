const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const { Database } = require('sqlite3');
const { schedule } = require('node-cron');
const uws = require('uws');
const dateFns = require('date-fns');
const { join } = require('path');
const { readdirSync, unlink, rename, copyFile, existsSync, mkdir } = require('fs');
const Logger = require('./resources/js/Logger');
const config = require('./config.json');
const { version } = require('../package.json');

let counter = 0, daily = 0, weekly = 0, monthly = 0, yearly = 0, average = 0, fetchedDaysAmount = 1;
let sounds = [], statistics = [], chartData = [], milestones = [];

// On-boot database interaction
const db = new Database(config.databasePath, () => {
	db.exec('PRAGMA foreign_keys = ON;', pragmaErr => {
		if (pragmaErr) return Logger.error('Foreign key enforcement pragma query failed.');
	});
});

db.serialize(() => {
	db.get('SELECT counter FROM main_counter', [], (selectErr, row) => {
		if (!row || row.counter === undefined) {
			db.run('INSERT INTO main_counter ( counter ) VALUES ( 0 )');
			return Logger.warn('Counter not found, automatically inserted into the database and loaded as 0.');
		}
		counter = row.counter;

		return Logger.info('Main counter loaded.');
	});

	db.all('SELECT * FROM sounds', [], (selectErr, rows) => {
		if (!rows) return Logger.warn('No sounds found.');
		sounds = rows;

		return Logger.info('Sounds & rankings loaded.');
	});

	db.run('INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date( \'now\', \'localtime\'), 0 )');
	// Insert statistics entry for the boot day if it does not exist

	db.all('SELECT * FROM statistics', [], (selectErr, rows) => {
		if (!rows) return Logger.warn('No statistics found.');

		const startOfBootWeek = dateFns.startOfWeek(new Date(), { weekStartsOn: 1 }), endOfBootWeek = dateFns.endOfWeek(new Date(), { weekStartsOn: 1 });
		const startOfBootMonth = dateFns.startOfMonth(new Date()), endOfBootMonth = dateFns.endOfMonth(new Date());
		const startOfBootYear = dateFns.startOfYear(new Date()), endOfBootYear = dateFns.endOfYear(new Date());

		const thisWeek = rows.filter(row => dateFns.isWithinInterval(dateFns.parseISO(row.date), { start: startOfBootWeek, end: endOfBootWeek }));
		const thisMonth = rows.filter(row => dateFns.isWithinInterval(dateFns.parseISO(row.date), { start: startOfBootMonth, end: endOfBootMonth }));
		const thisYear = rows.filter(row => dateFns.isWithinInterval(dateFns.parseISO(row.date), { start: startOfBootYear, end: endOfBootYear }));

		daily = rows.find(row => row.date === dateFns.format(new Date(), 'yyyy-MM-dd')).count;
		weekly = thisWeek.reduce((total, date) => total += date.count, 0);
		monthly = thisMonth.reduce((total, date) => total += date.count, 0);
		yearly = thisYear.reduce((total, date) => total += date.count, 0);
		fetchedDaysAmount = thisMonth.length;
		average = Math.round(monthly / thisMonth.length);

		statistics = rows;
		return Logger.info('Statistics loaded.');
	});

	db.all('SELECT substr(date, 1, 7) AS month, sum(count) AS count FROM statistics GROUP BY month ORDER BY month ASC', [], (selectErr, rows) => {
		if (!rows) return Logger.warn('No chart data found.');
		chartData = rows;

		return Logger.info('Chart data loaded.');
	});

	db.all('SELECT * FROM milestones', [], (selectErr, rows) => {
		if (!rows) return Logger.warn('No milestones found.');
		milestones = rows;

		return Logger.info('Milestones loaded.');
	});
});

// Webserver
const server = express();
const http = require('http').Server(server);

const pagePath = join(__dirname, '/pages');
const pages = [
	{
		name: 'robots.txt',
		path: join(pagePath, 'robots.txt'),
		route: '/robots.txt'
	},
	{
		name: 'sitemap.xml',
		path: join(pagePath, 'sitemap.xml'),
		route: '/sitemap.xml'
	}
];

function cleanString(string) {
	return string.replace(/\s/g, '-').toLowerCase();
}

readdirSync(pagePath).filter(f => f.endsWith('.html')).forEach(file => {
	const pageName = file.slice(0, -5).toLowerCase(); // -5 for cutting '.html'

	pages.push({
		name: file,
		path: join(pagePath, file),
		route: [`/${pageName}`, `/${pageName}.html`]
	});

	if (pageName === 'index') pages[pages.length - 1].route.push('/');
	// Last array item because during current iteration it will be the last (adds root-dir route for index)
});

server.use(helmet({
	hsts: false // HSTS sent via nginx
}));
if (config.SSLproxy) server.set('trust proxy', 1);
server.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: 'auto' }
}));
server.use(express.static('./resources'));

const apiRouter = express.Router();

apiRouter.use(express.urlencoded({ extended: true }));
apiRouter.use(express.json());

apiRouter.all('/*', (req, res, next) => {
	const apiEndpoints = apiRouter.stack.filter(r => r.route).map(r => r.route.path);

	if (!apiEndpoints.includes(req.path)) return res.status(404).json({ code: 404, name: 'Invalid route', message: 'Endpoint not found.' });
	else return next();
});

apiRouter.get('/', (req, res) => {
	return res.json({ code: 200, message: 'You have reached the megumin.love API.' });
});

apiRouter.get('/conInfo', (req, res) => {
	return res.json({ port: config.port, ssl: config.SSLproxy, version });
});

apiRouter.get('/counter', (req, res) => {
	return res.json({ counter });
});

apiRouter.get('/themes', (req, res) => {
	const themes = ['megumin', ...new Set(sounds.map(s => s.theme).filter(t => t))]; // Filter to remove "null" (i.e. no theme, default)
	return res.json(themes);
});

apiRouter.get('/sounds', (req, res) => { // eslint-disable-line complexity
	let requestedSounds = sounds;

	if (Object.keys(req.query).length) {
		const { theme, source } = req.query;
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((req.query.equals && isNaN(equals)) || (req.query.over && isNaN(over)) || (req.query.under && isNaN(under))) {
			// Check if the param was initially provided and if the input wasn't a number
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' });
		}

		if ((over && under) && over > under) {
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' });
		}

		// Theme filtering
		if (theme) requestedSounds = requestedSounds.filter(sound => {
			if (!sound.theme && theme === 'megumin') return true; // Default sounds have no theme
			else return sound.theme === theme;
		});

		// Source filtering
		if (source) requestedSounds = requestedSounds.filter(sound => {
			if (sound.source === 'no-source') return false;
			else return sound.source.toLowerCase() === source.toLowerCase();
		});

		// Count filtering
		if (equals || over || under) {
			if (equals) requestedSounds = requestedSounds.filter(sound => sound.count === equals);
			else if (over && !under) requestedSounds = requestedSounds.filter(sound => sound.count > over);
			else if (!over && under) requestedSounds = requestedSounds.filter(sound => sound.count < under);
			else if (over && under) requestedSounds = requestedSounds.filter(sound => sound.count > over && sound.count < under);
		}
	}

	return res.json(requestedSounds);
});

apiRouter.get('/statistics', (req, res) => { // eslint-disable-line complexity
	let requestedStatistics = statistics;
	const latestStatisticsEntry = dateFns.parseISO(statistics[statistics.length - 1].date);
	// Grab latest statistics entry from the object itself instead of just today's date to make sure the entry exists

	if (Object.keys(req.query).length) {
		const [from, to] = [dateFns.parseISO(req.query.from), dateFns.parseISO(req.query.to)];
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((req.query.from && isNaN(from)) || (req.query.to && isNaN(to))) {
			// Check if the param was initially provided, and if the input wasn't in the correct format
			return res.status(400).json({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in yyyy-MM-dd format.' });
		}

		if ((req.query.from && dateFns.isAfter(from, latestStatisticsEntry)) || (req.query.to && dateFns.isAfter(to, latestStatisticsEntry))) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'Dates may not be in the future.' });
		}

		if ((req.query.from && req.query.to) && dateFns.isAfter(from, to)) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'The start date must be before the end date.' });
		}

		if ((req.query.equals && isNaN(equals)) || (req.query.over && isNaN(over)) || (req.query.under && isNaN(under))) {
			// Check if the param was initially provided, and if the input wasn't a number
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' });
		}

		if ((over && under) && over > under) {
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' });
		}

		// Date filtering
		if (req.query.from && !req.query.to) {
			requestedStatistics = requestedStatistics.filter(day => {
				const parsedDate = dateFns.parseISO(day.date);
				return dateFns.isWithinInterval(parsedDate, { start: from, end: latestStatisticsEntry });
			});
		}
		else if (!req.query.from && req.query.to) {
			requestedStatistics = requestedStatistics.filter(day => {
				const parsedDate = dateFns.parseISO(day.date);
				return dateFns.isSameDay(parsedDate, to) || dateFns.isBefore(parsedDate, to);
			});
		}
		else if (req.query.from && req.query.to) {
			requestedStatistics = requestedStatistics.filter(day => {
				const parsedDate = dateFns.parseISO(day.date);
				return dateFns.isWithinInterval(parsedDate, { start: from, end: to });
			});
		}

		// Count filtering
		if (equals || over || under) {
			if (equals) {
				requestedStatistics = requestedStatistics.filter(day => day.count === equals);
			}
			else if (over && !under) {
				requestedStatistics = requestedStatistics.filter(day => day.count > over);
			}
			else if (!over && under) {
				requestedStatistics = requestedStatistics.filter(day => day.count < under);
			}
			else if (over && under) {
				requestedStatistics = requestedStatistics.filter(day => day.count > over && day.count < under);
			}
		}
	}

	return res.json(requestedStatistics);
});

apiRouter.get('/statistics/chartData', (req, res) => { // eslint-disable-line complexity
	let requestedChartData = chartData;
	const latestChartMonth = dateFns.parseISO(chartData[chartData.length - 1].month);
	// Grab latest statistics entry from the object itself instead of just today's date to make sure the entry exists

	if (Object.keys(req.query).length) {
		const [from, to] = [dateFns.parseISO(req.query.from), dateFns.parseISO(req.query.to)];
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((req.query.from && isNaN(from)) || (req.query.to && isNaN(to))) {
			// Check if the param was initially provided, and if the input wasn't in the correct format
			return res.status(400).json({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in yyyy-MM format.' });
		}

		if ((req.query.from && dateFns.isAfter(from, latestChartMonth)) || (req.query.to && dateFns.isAfter(to, latestChartMonth))) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'Dates may not be in the future.' });
		}

		if ((req.query.from && req.query.to) && dateFns.isAfter(from, to)) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'The start date must be before the end date.' });
		}

		if ((req.query.equals && isNaN(equals)) || (req.query.over && isNaN(over)) || (req.query.under && isNaN(under))) {
			// Check if the param was initially provided, and if the input wasn't a number
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' });
		}

		if ((over && under) && over > under) {
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' });
		}

		// Date filtering
		if (req.query.from && !req.query.to) {
			requestedChartData = requestedChartData.filter(data => {
				const parsedMonth = dateFns.parseISO(data.month);
				return dateFns.isWithinInterval(parsedMonth, { start: from, end: latestChartMonth });
			});
		}
		else if (!req.query.from && req.query.to) {
			requestedChartData = requestedChartData.filter(data => {
				const parsedMonth = dateFns.parseISO(data.month);
				return dateFns.isSameMonth(parsedMonth, to) || dateFns.isBefore(parsedMonth, to);
			});
		}
		else if (req.query.from && req.query.to) {
			requestedChartData = requestedChartData.filter(data => {
				const parsedMonth = dateFns.parseISO(data.month);
				return dateFns.isWithinInterval(parsedMonth, { start: from, end: to });
			});
		}

		// Count filtering
		if (equals || over || under) {
			if (equals) {
				requestedChartData = requestedChartData.filter(data => data.count === equals);
			}
			else if (over && !under) {
				requestedChartData = requestedChartData.filter(data => data.count > over);
			}
			else if (!over && under) {
				requestedChartData = requestedChartData.filter(data => data.count < under);
			}
			else if (over && under) {
				requestedChartData = requestedChartData.filter(data => data.count > over && data.count < under);
			}
		}
	}

	return res.json(requestedChartData);
});

apiRouter.get('/statistics/summary', (req, res) => {
	return res.json({ alltime: counter, daily, weekly, monthly, yearly, average });
});

apiRouter.get('/statistics/milestones', (req, res) => {
	const [reached, sound_id] = [parseInt(req.query.reached), parseInt(req.query.sound_id)];
	let requestedMilestones = milestones;

	if (!isNaN(reached)) {
		requestedMilestones = requestedMilestones.filter(ms => ms.reached === reached);
	}
	if (!isNaN(sound_id)) {
		requestedMilestones = requestedMilestones.filter(ms => ms.sound_id === sound_id);
	}

	return res.json(requestedMilestones);
});

apiRouter.post('/login', (req, res) => { // Only actual page (not raw API) uses this route
	if (config.adminToken === req.body.token) {
		req.session.loggedIn = true;
		Logger.info('A user has logged in on the \'/login\' endpoint.');

		return res.json({ code: 200, message: 'Successfully logged in!' });
	}
	else {
		return res.status(401).json({ code: 401, name: 'Access denied', message: 'Invalid token provided.' });
	}
});

apiRouter.all(['/admin/', '/admin/*'], (req, res, next) => {
	if (config.adminToken === req.headers.authorization) {
		Logger.info(`A user has sent a request to the '${req.path}' endpoint.`);
		return next();
	}
	else {
		return res.status(401).json({ code: 401, name: 'Access denied', message: 'Invalid token provided.' });
	}
});

apiRouter.get('/admin/logout', (req, res) => {
	req.session.destroy();
	Logger.info('A user has logged out of the admin panel.');
	return res.json({ code: 200, message: 'Successfully logged out!' });
});

apiRouter.all('/admin/sounds/*', (req, res, next) => {
	const originalData = req.body;
	const parsedData = {};

	Object.keys(originalData).forEach(d => {
		if (!isNaN(parseInt(originalData[d]))) return parsedData[d] = parseInt(originalData[d]);
		else if (typeof originalData[d] === 'string') return parsedData[d] = originalData[d].trim();
		else return parsedData[d] = originalData[d];
	});

	if (parsedData.filename === '') {
		return res.status(400).json({ code: 400, name: 'Invalid filename', message: 'Sound filename may not be an empty string if provided.' });
	}
	if (parsedData.filename && sounds.find(sound => sound.filename === parsedData.filename)) {
		return res.status(400).json({ code: 400, name: 'Invalid filename', message: 'Sound filename already in use.' });
	}
	if (parsedData.count === '' || (originalData.count !== undefined && isNaN(parsedData.count))) {
		return res.status(400).json({ code: 400, name: 'Invalid count', message: 'Sound click count must be an integer if provided.' });
	}
	if (originalData.id !== undefined && isNaN(parseInt(parsedData.id))) {
		return res.status(400).json({ code: 400, name: 'Invalid sound', message: 'Sound ID must be an integer.' });
	}
	if (parsedData.id !== undefined && !sounds.find(sound => sound.id === parsedData.id)) {
		return res.status(404).json({ code: 404, name: 'Invalid sound', message: 'Sound not found.' });
	}

	if (parsedData.filename) parsedData.filename = parsedData.filename.toString();
	if (parsedData.displayname) parsedData.displayname = parsedData.displayname.toString();
	if (parsedData.theme) parsedData.theme = parsedData.theme.toString();
	if (parsedData.source) parsedData.source = parsedData.source.toString();

	req.body = parsedData;

	return next();
});

apiRouter.post('/admin/sounds/upload', multer({ dest: './resources/temp' }).single('file'), (req, res) => {
	let newSound;

	if (!req.file || (req.file && !['audio/mpeg', 'audio/mp3'].includes(req.file.mimetype))) {
		if (req.file) unlink(req.file.path, delError => {
			if (delError) {
				Logger.error(`An error occurred deleting the temporary file '${req.file.filename}', please check manually.`);
				return Logger.error(delError);
			}
		}); // If a wrong filetype was provided, delete the created temp file on rejection

		return res.status(400).json({ code: 400, name: 'Invalid file', message: 'An mp3 file must be provided.' });
	}

	const data = req.body;
	if (data.count === undefined) data.count = 0;
	if (!data.theme) data.theme = 'megumin'; // Default theme
	if (!data.source) data.source = 'no-source';

	if (!Object.keys(data).includes('filename')) {
		return res.status(400).json({ code: 400, name: 'Invalid filename', message: 'Sound filename must be provided.' });
	}

	Logger.info(`Sound '${data.filename}' (Shown as '${data.displayname}', from '${data.source}') now being uploaded.`);

	const latestID = sounds.length ? sounds[sounds.length - 1].id : 0;

	const valuePlaceholders = '?, '.repeat(Object.keys(data).length).slice(0, -2); // Cut off dangling comma and whitespace
	const columnNames = Object.keys(data).map(k => `"${k}"`).join(', ');

	const query = db.prepare(`INSERT INTO sounds ( ${columnNames} ) VALUES ( ${valuePlaceholders} )`);
	query.run(...Object.values(data), insertErr => {
		if (insertErr) {
			Logger.error('An error occurred creating the database entry, upload aborted.');
			Logger.error(insertErr);

			unlink(req.file.path, delError => {
				if (delError) {
					Logger.error(`An error occurred deleting the temporary file '${req.file.filename}', please check manually.`);
					return Logger.error(delError);
				} // Delete temporary file on failure
			});

			return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
		}
		Logger.info('(1/3): Database entry successfully created.');

		newSound = {
			id: latestID + 1,
			filename: data.filename,
			displayname: data.displayname || null,
			source: data.source,
			count: data.count,
			theme: data.theme
		};
		sounds.push(newSound);

		Logger.info('(2/3): Sound cache entry successfully created.');

		const folderPath = join('./resources/sounds/', cleanString(data.theme), cleanString(data.source));
		const folderExists = existsSync(folderPath);

		if (!folderExists) {
			mkdir(folderPath, createErr => {
				if (createErr) {
					Logger.error('An error occurred creating the new sound folder.');
					Logger.error(createErr);
					return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
				}
			});
		}

		const soundPath = join(folderPath, `${data.filename}.mp3`);

		rename(req.file.path, soundPath, renameErr => {
			if (renameErr) {
				Logger.error('An error occurred renaming the temporary file.');
				Logger.error(renameErr);
				return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
			}
			else Logger.info('(3/3): Uploaded mp3 file successfully renamed to requested filename.');
		});

		emitUpdate({
			type: 'soundUpload',
			sound: newSound
		});

		return res.json({ code: 200, message: 'Sound successfully uploaded.', sound: newSound });
	});
});

apiRouter.patch('/admin/sounds/modify', (req, res) => {
	const data = req.body;

	const stepAmount = data.hasOwnProperty('filename') ? 5 : 2;

	if (!data.id) {
		return res.status(400).json({ code: 400, name: 'Invalid sound', message: 'Sound ID must be provided.' });
	}
	if (!['filename', 'displayname', 'source', 'count', 'theme'].some(p => Object.keys(data).includes(p))) {
		return res.status(400).json({ code: 400, name: 'Invalid parameters', message: 'At least one property to modify must be provided.' });
	}

	const changedSound = sounds.find(sound => sound.id === data.id);
	Logger.info(`Sound '${changedSound.filename}' now being modified.`);

	if (!data.filename) data.filename = changedSound.filename;

	let columnPlaceholders = '';

	const changedProperties = Object.assign({}, data);
	delete changedProperties.id; // Only properties to change wanted

	Object.keys(changedProperties).forEach(k => columnPlaceholders += `"${k}" = ?, `);
	columnPlaceholders = columnPlaceholders.slice(0, -2); // Cut off dangling comma and whitespace

	const query = db.prepare(`UPDATE sounds SET ${columnPlaceholders} WHERE id = ?`);

	query.run(...Object.values(changedProperties), data.id, updateErr => {
		if (updateErr) {
			Logger.error('An error occurred updating the database entry, renaming aborted.');
			Logger.error(updateErr);
			return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
		}
		Logger.info(`(1/${stepAmount}): Database entry successfully updated.`);

		const soundSource = cleanString(data.source || changedSound.source);
		const soundTheme = cleanString(data.theme || changedSound.theme);

		const newFolderPath = join('./resources/sounds/', soundTheme, soundSource);
		const newFolderExists = existsSync(newFolderPath);

		if (!newFolderExists) {
			mkdir(newFolderPath, createErr => {
				if (createErr) {
					Logger.error('An error occurred creating the new sound folder.');
					Logger.error(createErr);
					return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
				}
			});
		}

		const oldFolderPath = join('./resources/sounds/', cleanString(changedSound.theme), cleanString(changedSound.source));

		const oldSoundPath = join(oldFolderPath, `${changedSound.filename}.mp3`);
		const newSoundPath = join(newFolderPath, `${data.filename}.mp3`);

		Object.assign(changedSound, data);

		Logger.info(`(2/${stepAmount}): Sound cache entry successfully updated.`);

		if (data.filename || data.source || data.theme) {
			copyFile(oldSoundPath, `${oldSoundPath}.bak`, copyErr => {
				if (copyErr) {
					Logger.error('An error occurred backing up the original mp3 file, renaming aborted.');
					Logger.error(copyErr);
					return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
				}
				Logger.info(`(3/${stepAmount}): Original mp3 file successfully backed up.`);

				rename(oldSoundPath, newSoundPath, renameErr => {
					if (renameErr) {
						Logger.error('An error occurred renaming the original mp3 file, renaming aborted, restoring backup.');
						Logger.error(renameErr);
						rename(`${oldSoundPath}.bak`, oldSoundPath, backupResErr => {
							if (backupResErr) return Logger.error(`Backup restoration for the mp3 file failed.`);
						});

						return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
					}
					Logger.info(`(4/${stepAmount}): Original mp3 file successfully renamed.`);

					unlink(`${oldSoundPath}.bak`, unlinkErr => {
						if (unlinkErr) {
							Logger.warn('An error occurred deleting the original mp3 backup, please delete manually.');
							return Logger.error(unlinkErr);
						}
						Logger.info(`(5/${stepAmount}): Original mp3 backup successfully deleted.`);
					});
				});
			});
		}

		emitUpdate({
			type: 'soundModify',
			sound: changedSound
		});

		return res.json({ code: 200, message: 'Sound successfully modified.', sound: changedSound });
	});
});

apiRouter.delete('/admin/sounds/delete', (req, res) => {
	const data = req.body;

	const deletedSound = sounds.find(sound => sound.id === data.id);
	Logger.info(`Sound '${deletedSound.filename}' now being deleted.`); // eslint-disable-line max-len

	const query = db.prepare('DELETE FROM sounds WHERE id = ?');
	query.run(data.id, deleteErr => {
		if (deleteErr) {
			Logger.error('An error occurred while deleting the database entry, deletion aborted.');
			Logger.error(deleteErr);
			return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
		}
		Logger.info('(1/3): Database entry successfully deleted.');

		sounds.splice(sounds.findIndex(sound => sound.id === deletedSound.id), 1);
		Logger.info('(2/3): Sound cache entry successfully deleted.');

		const sourceFolder = cleanString(deletedSound.source);

		unlink(`./resources/sounds/${deletedSound.theme}/${sourceFolder}/${deletedSound.filename}.mp3`, unlinkErr => {
			if (unlinkErr) {
				Logger.error('An error occurred while deleting the mp3 file.');
				Logger.error(unlinkErr);
				return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
			}
			Logger.info('(3/3): mp3 file successfully deleted.');

			emitUpdate({
				type: 'soundDelete',
				sound: deletedSound
			});

			return res.json({ code: 200, message: 'Sound successfully deleted.', sound: deletedSound });
		});
	});
});

apiRouter.all('/admin/milestones/*', (req, res, next) => {
	const originalData = req.body;
	const parsedData = {};

	Object.keys(originalData).forEach(d => {
		if (!isNaN(parseInt(originalData[d]))) return parsedData[d] = parseInt(originalData[d]);
		else if (typeof originalData[d] === 'string') return parsedData[d] = originalData[d].trim();
		else return parsedData[d] = originalData[d];
	});

	if (originalData.id && isNaN(parsedData.id)) {
		return res.status(400).json({ code: 400, name: 'Invalid milestone', message: 'Milestone ID must be an integer.' });
	}
	if (originalData.count !== undefined && isNaN(parsedData.count)) {
		return res.status(400).json({ code: 400, name: 'Invalid count', message: 'Milestone count must be an integer.' });
	}
	if (originalData.reached !== undefined && isNaN(parsedData.reached)) {
		return res.status(400).json({ code: 400, name: 'Invalid status', message: 'Milestone reached status must be an integer if provided.' });
	}
	if (originalData.timestamp && isNaN(parsedData.timestamp)) {
		return res.status(400).json({ code: 400, name: 'Invalid timestamp', message: 'Milestone timestamp must be an integer if provided.' });
	}
	if (originalData.sound_id && isNaN(parsedData.sound_id)) {
		return res.status(400).json({ code: 400, name: 'Invalid sound', message: 'Milestone sound_id must be an integer if provided.' });
	}
	if (originalData.reached !== undefined && (parsedData.reached !== 0 && parsedData.reached !== 1)) {
		return res.status(400).json({ code: 400, name: 'Invalid status', message: 'Milestone reached status must be an integer of either 0 or 1 if provided.' }); // eslint-disable-line max-len
	} // Checking for undefined because reached property can have value 0 which is falsy but still defined
	if (originalData.id && !milestones.find(ms => ms.id === parsedData.id)) {
		return res.status(404).json({ code: 404, name: 'Invalid milestone', message: 'Milestone not found.' });
	}

	req.body = parsedData;

	return next();
});

apiRouter.post('/admin/milestones/add', (req, res) => {
	const data = req.body;
	if (!data.reached) data.reached = 0;

	if (!data.count) {
		return res.status(400).json({ code: 400, name: 'Invalid count', message: 'Milestone count must be provided.' });
	}

	Logger.info(`Milestone with count ${data.count} now being added.`);

	if (milestones.find(ms => ms.count === data.count)) {
		Logger.error(`A milestone with count ${data.count} already exists, adding aborted.`);
		return res.status(400).json({ code: 400, name: 'Invalid count', message: 'Milestone with submitted count already exists.' });
	}
	else {
		const latestID = milestones.length ? milestones[milestones.length - 1].id : 0;
		const valuePlaceholders = '?, '.repeat(Object.keys(data).length).slice(0, -2); // Cut off dangling comma and whitespace
		const columnNames = Object.keys(data).map(k => `"${k}"`).join(', ');

		const query = db.prepare(`INSERT INTO milestones ( ${columnNames} ) VALUES ( ${valuePlaceholders} )`);
		query.run(...Object.values(data), insertErr => {
			if (insertErr) {
				Logger.error('An error occurred creating the database entry, addition aborted.');
				Logger.error(insertErr);
				const errorCode = insertErr.code.includes('CONSTRAINT') ? 400 : 500;
				const errorMessage = errorCode === 400 ? 'Sound ID must match a sound on the site.' : 'Please check the server console.';
				const errorName = errorCode === 400 ? 'Invalid sound' : 'Serverside error';

				return res.status(errorCode).json({ code: errorCode, name: errorName, message: errorMessage });
			}
			Logger.info('(1/2): Database entry successfully created.');

			const newMilestone = {
				id: latestID + 1,
				count: data.count,
				reached: data.reached,
				timestamp: data.timestamp || null,
				sound_id: data.sound_id || null
			};
			milestones.push(newMilestone);

			Logger.info('(2/2): Milestone cache entry successfully created.');

			emitUpdate({
				type: 'milestoneAdd',
				milestone: newMilestone
			});

			return res.json({ code: 200, message: 'Milestone successfully added.', milestone: newMilestone });
		});
	}
});

apiRouter.patch('/admin/milestones/modify', (req, res) => {
	const data = req.body;

	if (!data.id) {
		return res.status(400).json({ code: 400, name: 'Invalid milestone', message: 'Milestone ID must be provided.' });
	}
	if (!['count', 'reached', 'timestamp', 'sound_id'].some(p => Object.keys(data).includes(p))) {
		return res.status(400).json({ code: 400, name: 'Invalid parameters', message: 'At least one property to modify must be provided.' });
	}

	const changedMilestone = milestones.find(ms => ms.id === data.id);
	Logger.info(`Milestone ${changedMilestone.id} (${changedMilestone.count} clicks) now being modified.`);

	let columnPlaceholders = '';

	const changedProperties = Object.assign({}, data);
	delete changedProperties.id; // Only properties to change wanted

	Object.keys(changedProperties).forEach(k => columnPlaceholders += `"${k}" = ?, `);
	columnPlaceholders = columnPlaceholders.slice(0, -2); // Cut off dangling comma and whitespace

	const query = db.prepare(`UPDATE milestones SET ${columnPlaceholders} WHERE id = ?`);
	query.run(...Object.values(changedProperties), data.id, updateErr => {
		if (updateErr) {
			Logger.error('An error occurred updating the database entry, modification aborted.');
			Logger.error(updateErr);
			const errorCode = updateErr.code.includes('CONSTRAINT') ? 400 : 500;
			const errorMessage = errorCode === 400 ? 'Sound ID must match a sound on the site.' : 'Please check the server console.';
			const errorName = errorCode === 400 ? 'Invalid sound' : 'Serverside error';

			return res.status(errorCode).json({ code: errorCode, name: errorName, message: errorMessage });
		}
		Logger.info('(1/2): Database entry successfully updated.');

		Object.assign(changedMilestone, data);

		Logger.info('(2/2): Milestone cache entry successfully updated.');

		emitUpdate({
			type: 'milestoneModify',
			milestone: changedMilestone
		});

		return res.json({ code: 200, message: 'Milestone successfully modified.', milestone: changedMilestone });
	});
});

apiRouter.delete('/admin/milestones/delete', (req, res) => {
	const data = req.body;

	if (!data.id) {
		return res.status(400).json({ code: 400, name: 'Invalid milestone', message: 'Milestone ID must be provided.' });
	}

	const deletedMilestone = milestones.find(ms => ms.id === data.id);
	Logger.info(`Milestone ${deletedMilestone.id} (${deletedMilestone.count} clicks) now being deleted.`);

	const query = db.prepare('DELETE FROM milestones WHERE id = ?');
	query.run(data.id, deleteErr => {
		if (deleteErr) {
			Logger.error('An error occurred while deleting the database entry, deletion aborted.');
			Logger.error(deleteErr);
			return res.status(500).json({ code: 500, name: 'Serverside error', message: 'Please check the server console.' });
		}
		Logger.info('(1/2): Database entry successfully deleted.');

		milestones.splice(milestones.findIndex(ms => ms.id === deletedMilestone.id), 1);
		Logger.info('(2/2): Milestone cache entry successfully deleted.');

		emitUpdate({
			type: 'milestoneDelete',
			milestone: deletedMilestone
		});

		return res.json({ code: 200, message: 'Milestone successfully deleted.', milestone: deletedMilestone });
	});
});

apiRouter.post('/admin/notification', (req, res) => {
	const data = req.body;

	if (!data.duration || !data.text) return res.json({ code: 400, name: 'Invalid notification', message: 'Notification text and duration must be provided.' });

	Logger.info(`Announcement with text '${data.text}' displayed for ${data.duration} seconds.`);

	emitUpdate({
		type: 'notification',
		notification: data
	});

	return res.json({ code: 200, message: 'Notification sent.' });
});

server.use('/api', apiRouter);

for (const page of pages) {
	if (page.name === 'admin.html') {
		server.get(page.route, (req, res) => {
			if (!req.session.loggedIn) return res.status('401').sendFile('401.html', { root: './pages/error/' });
			else return res.sendFile(page.path);
		});
		continue;
	}
	server.get(page.route, (req, res) => res.sendFile(page.path));
}

server.use((req, res) => res.status(404).sendFile('404.html', { root: './pages/error/' }));
server.use((req, res) => res.status(401).sendFile('401.html', { root: './pages/error/' }));
server.use((req, res) => res.status(500).sendFile('500.html', { root: './pages/error/' }));

http.listen(config.port, () => {
	const options = `${config.SSLproxy ? ' (Proxied to SSL)' : ''}`;
	return Logger.info(`megumin.love booting on port ${config.port}...${options}`);
});

// Socket server
const socketServer = new uws.Server({ server: http });

function emitUpdate(eventData, options = {}) {
	if (options.excludeSocket) {
		return socketServer.clients.forEach(socket => {
			if (socket !== options.excludeSocket) socket.send(JSON.stringify(eventData));
		});
	}
	if (options.targetSocket) {
		return options.targetSocket.send(JSON.stringify(eventData));
	}

	return socketServer.clients.forEach(socket => socket.send(JSON.stringify(eventData)));
}

socketServer.on('connection', socket => {
	socket.pingInterval = setInterval(() => socket.ping(), 1000 * 45);

	socket.on('message', message => {
		let data;

		try {
			data = JSON.parse(message);
		}
		catch (e) {
			data = {};
		}

		if (!['click', 'sbClick'].includes(data.type)) return;

		if (data.type === 'click') {
			const soundEntry = sounds.find(s => s.filename === data.soundFilename);

			if (!soundEntry) return;

			const currentDate = dateFns.format(new Date(), 'yyyy-MM-dd');
			const currentMonth = currentDate.substring(0, 7);
			const currentMonthData = chartData.find(d => d.month === currentMonth);

			++counter;
			++daily; ++weekly;
			++monthly; ++yearly;
			average = Math.round(monthly / fetchedDaysAmount);

			currentMonthData ? currentMonthData.count++ : chartData.push({ count: 1, month: currentMonth });

			statistics.find(s => s.date === currentDate).count = daily;

			const reachedMilestone = milestones.filter(ms => ms.count <= counter && !ms.reached)[0];
			if (reachedMilestone) {
				const timestamp = Date.now();

				Logger.info(`Milestone ${reachedMilestone.id} (${reachedMilestone.count} clicks) reached! Entry being updated.`);

				Object.assign(reachedMilestone, { reached: 1, timestamp, sound_id: soundEntry.id });

				const query = db.prepare('UPDATE milestones SET reached = ?, timestamp = ?, sound_id = ? WHERE id = ?');
				query.run(1, timestamp, soundEntry.id, reachedMilestone.id, updateErr => {
					if (updateErr) {
						Logger.error('An error occurred updating the milestone entry.');
						Logger.error(updateErr);
					}

					const readableCount = reachedMilestone.count.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

					emitUpdate({
						type: 'notification',
						notification: {
							text: `Milestone ${reachedMilestone.id} of ${readableCount} clicks has been reached!`,
							duration: 3
						}
					});

					return emitUpdate({
						type: 'milestoneUpdate',
						milestone: reachedMilestone
					});
				});
			}

			emitUpdate({
				type: 'crazyMode',
				soundFilename: soundEntry.filename
			}, { excludeSocket: socket });

			return emitUpdate({
				type: 'counterUpdate',
				counter,
				statistics: {
					summary: { alltime: counter, daily, weekly, monthly, yearly, average },
					newChartData: currentMonthData
				},
			});
		}

		if (data.type === 'sbClick') {
			const soundEntry = sounds.find(sound => sound.filename === data.soundFilename);

			if (soundEntry) ++soundEntry.count;
			else return;

			emitUpdate({
				type: 'crazyMode',
				soundFilename: soundEntry.filename
			}, { excludeSocket: socket });

			return emitUpdate({
				type: 'soundClick',
				sound: soundEntry
			});
		}
	});

	socket.on('close', (code, reason) => {
		return clearInterval(socket.pingInterval);
	});
});

// Database updates
schedule(`*/${Math.round(config.updateInterval)} * * * *`, () => {
	db.serialize(() => {
		db.run('UPDATE main_counter SET counter = ?', counter);

		db.run('INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date("now", "localtime"), ? )', daily);
		db.run('UPDATE statistics SET count = ? WHERE date = date("now", "localtime")', daily);

		for (const sound of sounds) {
			db.run('UPDATE sounds SET count = ? WHERE id = ?', sound.count, sound.id);
		}
	});

	return Logger.info('Database updated.');
}); // Update db at every n-th minute

schedule('0 0 1 1 *', () => {
	yearly = 0;

	Logger.info('Yearly counter reset.');
	return emitUpdate({
		type: 'counterUpdate',
		counter,
		statistics: {
			summary: { alltime: counter, daily, weekly, monthly, yearly, average }
		},
	});
}); // Reset yearly counter at the start of each year

schedule('0 0 1 * *', () => {
	monthly = 0; fetchedDaysAmount = 1;

	Logger.info('Monthly counter & fetched days amount reset.');
	return emitUpdate({
		type: 'counterUpdate',
		counter,
		statistics: {
			summary: { alltime: counter, daily, weekly, monthly, yearly, average }
		},
	});
}); // Reset monthly counter at the start of each month

schedule('0 0 * * 1', () => {
	weekly = 0;

	Logger.info('Weekly counter reset.');
	return emitUpdate({
		type: 'counterUpdate',
		counter,
		statistics: {
			summary: { alltime: counter, daily, weekly, monthly, yearly, average }
		},
	});
}); // Reset weekly counter at the start of each week

schedule('1 0 * * *', () => {
	daily = 0; ++fetchedDaysAmount;
	average = Math.round(monthly / fetchedDaysAmount);

	const latestID = statistics[statistics.length - 1].id;

	statistics.push({
		id: latestID + 1,
		date: dateFns.format(new Date(), 'yyyy-MM-dd'),
		count: 0,
	});

	Logger.info('Daily counter reset & fetched days amount incremented.');
	return emitUpdate({
		type: 'counterUpdate',
		counter,
		statistics: {
			summary: { alltime: counter, daily, weekly, monthly, yearly, average }
		},
	});
}); // Reset daily counter and update local statistics map at 1 minute past midnight