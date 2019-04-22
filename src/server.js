const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const { Database } = require('sqlite3');
const { schedule } = require('node-cron');
const uws = require('uws');
const dateFns = require('date-fns');
const { join } = require('path');
const { readdirSync, unlink, rename, copyFile } = require('fs');
const Logger = require('./resources/js/Logger');
const config = require('./config.json');
const { version: packageVersion } = require('../package.json');

let counter = 0, daily = 0, weekly = 0, monthly = 0, yearly = 0, average = 0, fetchedDaysAmount = 1;
let sounds = [], chartData = {}, milestones = [], version = '';
const statistics = {};

// On-boot database interaction
const db = new Database(config.databasePath, () => {
	db.exec('PRAGMA foreign_keys = ON;', pragmaErr => {
		if (pragmaErr) return Logger.error('Foreign key enforcement pragma query failed.');
	});
});

db.serialize(() => {
	db.get('SELECT version FROM meta', [], (selectErr, row) => {
		if (!row || !row.version) {
			version = packageVersion;
			return Logger.warn('No version number found, substituted by package.json value. You should consider fixing this in the database.');
		}
		version = row.version;

		return Logger.info('Version number loaded.');
	});

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

		const thisWeek = rows.filter(row => dateFns.isWithinRange(row.date, startOfBootWeek, endOfBootWeek));
		const thisMonth = rows.filter(row => dateFns.isWithinRange(row.date, startOfBootMonth, endOfBootMonth));
		const thisYear = rows.filter(row => dateFns.isWithinRange(row.date, startOfBootYear, endOfBootYear));

		daily = rows.find(row => row.date === dateFns.format(new Date(), 'YYYY-MM-DD')).count;
		weekly = thisWeek.reduce((total, date) => total += date.count, 0);
		monthly = thisMonth.reduce((total, date) => total += date.count, 0);
		yearly = thisYear.reduce((total, date) => total += date.count, 0);
		fetchedDaysAmount = thisMonth.length;
		average = Math.round(monthly / thisMonth.length);

		rows.map(date => statistics[date.date] = date.count);
		return Logger.info('Statistics loaded.');
	});

	db.all('SELECT sum(count) AS count, substr(date, 1, 7) AS month FROM statistics GROUP BY month ORDER BY month ASC', [], (selectErr, rows) => {
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

function validateParameters({ parameters = {}, step, dateLimiter }) { // eslint-disable-line complexity
	const dateRegex = new RegExp(`^(\\d{4})-(\\d{2})${step === 'day' ? '-(\\d{2})' : ''}$`);
	// YYYY-MM-DD for day step, YYYY-MM for month step

	const { from, to, source } = parameters;
	const [equals, over, under] = [parseInt(parameters.equals), parseInt(parameters.over), parseInt(parameters.under)];

	if ((from && !dateRegex.test(from)) || (to && !dateRegex.test(to))) {
		return { code: 400, name: 'Wrong Format', message: `Dates must be provided in YYYY-MM${step === 'day' ? '-DD' : ''} format.` };
	}

	if ((to && dateFns.isAfter(to, dateLimiter)) || (from && dateFns.isAfter(from, dateLimiter))) {
		return { code: 400, name: 'Invalid timespan', message: 'Dates may not be in the future.' };
	}

	if ((to && from) && dateFns.isAfter(from, to)) {
		return { code: 400, name: 'Invalid timespan', message: 'The start date must be before the end date.' };
	}

	if ((parameters.equals && isNaN(equals)) || (parameters.over && isNaN(over)) || (parameters.under && isNaN(under))) {
		// Check if the param was initially supplied, and if the input wasn't a number
		return { code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' };
	}

	if ((over && under) && over > under) {
		return { code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' };
	}

	return { code: 200 };
}

/*
	Using a date iterator instead of simply looping over the statistics/chart data because I also want to fill out
	the object values for dates that are not present in the database. Looping over the statistics wouldn't
	let me grab the dates that aren't present there and using a seperate date iterator inside that loop
	would not work if the difference between current statistics iteration and date iterator is bigger than one.
*/
function filterData(data, startDate, endDate, step, condition) {
	if (!condition) condition = () => true; // If no condition provided, default to pass all
	let iterator = startDate;
	let filteredResult;

	if (Array.isArray(data)) filteredResult = [];
	else filteredResult = {};

	const steps = {
		day: [dateFns.differenceInDays, dateFns.addDays, 'YYYY-MM-DD'],
		month: [dateFns.differenceInMonths, dateFns.addMonths, 'YYYY-MM']
	};

	while (steps[step][0](endDate, iterator) >= 0) {
		if (Array.isArray(data)) {
			if (!data.find(d => d.month === iterator)) filteredResult.push({ month: iterator, count: 0 });
			// Check for months missing in statistics and insert value for those
			if (data.find(d => d.month === iterator) && condition(iterator)) {
				filteredResult.push(data.find(d => d.month === iterator));
			}
		}
		else {
			if (!data.hasOwnProperty(iterator)) filteredResult[iterator] = 0;
			// Check for days missing in statistics and insert value for those
			if (data.hasOwnProperty(iterator) && condition(iterator)) {
				filteredResult[iterator] = data[iterator];
			}
		}

		iterator = dateFns.format(steps[step][1](iterator, 1), steps[step][2]);
	}

	return filteredResult;
}

function dateFilter({ data, parameters = {}, dataEdges = {}, step = '' }) {
	const { from, to } = parameters;
	const { start, end } = dataEdges;

	if (from && !to) {
		data = filterData(data, from, end, step, iterator => {
			return dateFns.isWithinRange(iterator, from, end);
		});
	}
	else if (!from && to) {
		data = filterData(data, start, to, step, iterator => {
			if (step === 'day') return dateFns.isSameDay(iterator, to) || dateFns.isBefore(iterator, to);
			else if (step === 'month') return dateFns.isSameMonth(iterator, to) || dateFns.isBefore(iterator, to);
		});
	}
	else if (from && to) {
		data = filterData(data, from, to, step, iterator => {
			return dateFns.isWithinRange(iterator, from, to);
		});
	}

	return data;
}

function countFilter({ data, parameters = {}, dataEdges = {}, step = '' }) {
	const { equals, over, under } = parameters;
	const { start, end } = dataEdges;

	if (equals || over || under) {
		if (equals) {
			data = filterData(data, start, end, step, iterator => {
				if (step === 'day') return data[iterator] === equals;
				else if (step === 'month') {
					const dataCount = data.find(d => d.month === iterator).count;
					return dataCount === equals;
				}
			});
		}
		else if (over && !under) {
			data = filterData(data, start, end, step, iterator => {
				if (step === 'day') return data[iterator] > over;
				else if (step === 'month') {
					const dataCount = data.find(d => d.month === iterator).count;
					return dataCount > over;
				}
			});
		}
		else if (!over && under) {
			data = filterData(data, start, end, step, iterator => {
				if (step === 'day') return data[iterator] < under;
				else if (step === 'month') {
					const dataCount = data.find(d => d.month === iterator).count;
					return dataCount < under;
				}
			});
		}
		else if (over && under) {
			data = filterData(data, start, end, step, iterator => {
				if (step === 'day') return data[iterator] > over && data[iterator] < under;
				else if (step === 'month') {
					const dataCount = data.find(d => d.month === iterator).count;
					return dataCount > over && dataCount < under;
				}
			});
		}

		if (step === 'day') {
			for (const entryKey in data) {
				if (data[entryKey] === 0) delete data[entryKey];
			} // Remove padded entries if a count filter is used
		}
		else if (step === 'month') {
			data = data.filter(entry => entry.count !== 0);
			// Remove padded entries if a count filter is used
		}
	}

	return data;
}

const apiRouter = express.Router();

apiRouter.use(express.urlencoded({ extended: true }));
apiRouter.use(express.json());

apiRouter.all('/*', (req, res, next) => {
	const apiEndpoints = apiRouter.stack.filter(r => r.route).map(r => r.route.path);

	if (!apiEndpoints.includes(req.path)) return res.status(404).json({ code: 404, message: 'Endpoint not found.' });
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

apiRouter.get('/sounds', (req, res) => { // eslint-disable-line complexity
	let requestedSounds = sounds;

	if (Object.keys(req.query).length) {
		const parameterResult = validateParameters({ parameters: req.query });

		if (parameterResult.code !== 200) return res.status(parameterResult.code).json(parameterResult);
		else {
			const { source } = req.query;
			const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

			// Source filtering
			if (source) requestedSounds = requestedSounds.filter(sound => sound.source.toLowerCase() === source.toLowerCase());

			// Count filtering
			if ((equals && !isNaN(equals)) || (over && !isNaN(over)) || (under && !isNaN(under))) {
				if (equals) requestedSounds = requestedSounds.filter(sound => sound.count === equals);
				else if (over && !under) requestedSounds = requestedSounds.filter(sound => sound.count > over);
				else if (!over && under) requestedSounds = requestedSounds.filter(sound => sound.count < under);
				else if (over && under) requestedSounds = requestedSounds.filter(sound => sound.count > over && sound.count < under);
			}
		}
	}

	return res.json(requestedSounds);
});

apiRouter.get('/statistics', (req, res) => { // eslint-disable-line complexity
	let requestedStatistics = statistics;
	const firstStatisticsEntry = Object.keys(statistics)[0];
	const latestStatisticsEntry = Object.keys(statistics)[Object.keys(statistics).length - 1];
	// Grab latest statistics entry from the object itself instead of just today's date to make sure the entry exists

	if (Object.keys(req.query).length) {
		const parameterResult = validateParameters({ parameters: req.query, step: 'day', dateLimiter: latestStatisticsEntry });

		if (parameterResult.code !== 200) return res.status(parameterResult.code).json(parameterResult);
		else {
			const { from, to } = req.query;
			const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

			if (from || to) requestedStatistics = dateFilter(
				{
					data: requestedStatistics,
					parameters: { from, to },
					dataEdges: { start: firstStatisticsEntry, end: latestStatisticsEntry },
					step: 'day'
				}
			);

			if ((equals && !isNaN(equals)) || (over && !isNaN(over)) || (under && !isNaN(under))) requestedStatistics = countFilter(
				{
					data: requestedStatistics,
					parameters: { equals, over, under },
					dataEdges: { start: firstStatisticsEntry, end: latestStatisticsEntry },
					step: 'day'
				}
			);
		}
	}
	else {
		requestedStatistics = filterData(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry, 'day');
	}

	return res.json(requestedStatistics);
});

apiRouter.get('/statistics/milestones', (req, res) => {
	const [reached, soundID] = [parseInt(req.query.reached), parseInt(req.query.soundID)];
	let requestedMilestones = milestones;

	if (!isNaN(reached)) {
		requestedMilestones = requestedMilestones.filter(ms => ms.reached === reached);
	}
	if (!isNaN(soundID)) {
		requestedMilestones = requestedMilestones.filter(ms => ms.soundID === soundID);
	}

	return res.json(requestedMilestones);
});

apiRouter.get('/statistics/summary', (req, res) => {
	return res.json({
		alltime: counter,
		daily,
		weekly,
		monthly,
		yearly,
		average
	});
});

apiRouter.get('/statistics/chartData', (req, res) => { // eslint-disable-line complexity
	let requestedChartData = chartData;
	const firstChartMonth = chartData[0].month;
	const latestChartMonth = chartData[chartData.length - 1].month;

	if (Object.keys(req.query).length) {
		const parameterResult = validateParameters({ parameters: req.query, step: 'month', dateLimiter: latestChartMonth });

		if (parameterResult.code !== 200) return res.status(parameterResult.code).json(parameterResult);
		else {
			const { to, from } = req.query;
			const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

			if (from || to) requestedChartData = countFilter(
				{
					data: requestedChartData,
					parameters: { from, to },
					dataEdges: { start: firstChartMonth, end: latestChartMonth },
					step: 'month'
				}
			);

			if ((equals && !isNaN(equals)) || (over && !isNaN(over)) || (under && !isNaN(under))) requestedChartData = countFilter(
				{
					data: requestedChartData,
					parameters: { equals, over, under },
					dataEdges: { start: firstChartMonth, end: latestChartMonth },
					step: 'month'
				}
			);
		}
	}
	else {
		requestedChartData = filterData(requestedChartData, firstChartMonth, latestChartMonth, 'month');
	}

	return res.json(requestedChartData);
});

apiRouter.post('/login', (req, res) => { // Only actual page (not raw API) uses this route
	if (config.adminToken === req.body.token) {
		req.session.loggedIn = true;
		Logger.info('A user has authenticated on the \'/login\' endpoint.');

		return res.json({ code: 200, message: 'Successfully authenticated!' });
	}
	else {
		return res.status(401).json({ code: 401, message: 'Invalid token provided.' });
	}
});

apiRouter.all(['/admin/', '/admin/*'], (req, res, next) => {
	if (config.adminToken === req.headers.authorization) {
		Logger.info(`A user has sent a request to the '${req.path}' endpoint.`);
		return next();
	}
	else {
		return res.status(401).json({ code: 401, message: 'Invalid token provided.' });
	}
});

apiRouter.get('/admin/logout', (req, res) => {
	req.session.destroy();
	Logger.info('A user has logged out of the admin panel.');
	return res.json({ code: 200, message: 'Successfully logged out!' });
});

apiRouter.post('/admin/sounds/upload', multer({ dest: './resources/temp' }).single('file'), (req, res) => {
	let newSound;

	if (!req.file || (req.file && !['audio/mpeg', 'audio/mp3'].includes(req.file.mimetype))) {
		if (req.file) unlink(req.file.path, delError => {
			if (delError) {
				Logger.error(`An error occurred deleting the temporary file '${req.file.filename}', please check manually.`);
				return Logger.error(delError);
			}
		}); // If a wrong filetype was supplied, delete the created temp file on rejection

		return res.status(400).json({ code: 400, message: 'An mp3 file must be supplied.' });
	}

	const data = req.body;
	if (data.count === undefined) data.count = 0;

	const soundData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return soundData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return soundData[d] = data[d].trim();
		else return soundData[d] = data[d];
	});

	if (!['filename'].every(p => Object.keys(soundData).includes(p))) {
		return res.status(400).json({ code: 400, message: 'Filename value must be provided.' });
	}
	if ((data.filename !== undefined && soundData.filename === '') || (data.count !== undefined && soundData.count === '')) {
		return res.status(400).json({ code: 400, message: 'Filename and count may not be an empty string.' });
	}
	if (data.count !== undefined && isNaN(soundData.count)) {
		return res.status(400).json({ code: 400, message: 'Count must be an integer if provided.' });
	}

	Logger.info(`Sound '${soundData.filename}' (Shown as '${soundData.displayname}', from '${soundData.source}') now being uploaded.`);

	if (sounds.find(sound => sound.filename === soundData.filename)) {
		Logger.error(`A sound with filename '${soundData.filename}' already exists, upload aborted.`);
		return res.status(400).json({ code: 400, message: 'Sound filename already in use.' });
	}
	else {
		const latestID = sounds.length ? sounds[sounds.length - 1].id : 0;

		rename(req.file.path, `./resources/sounds/${soundData.filename}.mp3`, renameErr => {
			if (renameErr) {
				Logger.error('An error occurred renaming the temporary file.');
				Logger.error(renameErr);
				return res.status(500).json({ code: 500, message: 'Please check the server console..' });
			}
			else Logger.info('(1/3): Uploaded mp3 file successfully renamed to requested filename.');
		});

		const valuePlaceholders = '?, '.repeat(Object.keys(soundData).length).slice(0, -2); // Cut off dangling comma and whitespace

		const query = db.prepare(`INSERT INTO sounds ( ${Object.keys(soundData).join(', ')} ) VALUES ( ${valuePlaceholders} )`);
		query.run(...Object.values(soundData), insertErr => {
			if (insertErr) {
				Logger.error('An error occurred creating the database entry, upload aborted.');
				Logger.error(insertErr);
				return res.status(500).json({ code: 500, message: 'Please check the server console.' });
			}
			Logger.info('(2/3): Database entry successfully created.');

			newSound = {
				id: latestID + 1,
				filename: soundData.filename,
				displayname: soundData.displayname || null,
				source: soundData.source || null,
				count: soundData.count,
				association: soundData.association || null
			};
			sounds.push(newSound);

			Logger.info('(3/3): Sound cache entry successfully created.');

			emitUpdate({
				type: 'soundUpload',
				sound: newSound
			});

			return res.json({ code: 200, message: 'Sound successfully uploaded.', sound: newSound });
		});
	}
});

apiRouter.patch('/admin/sounds/modify', (req, res) => {
	const data = req.body;

	const soundData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return soundData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return soundData[d] = data[d].trim();
		else return soundData[d] = data[d];
	});

	const stepAmount = soundData.hasOwnProperty('filename') ? 5 : 2;

	if (!data.id) {
		return res.status(400).json({ code: 400, message: 'Sound ID must be provided.' });
	}
	if (data.id && isNaN(soundData.id)) {
		return res.status(400).json({ code: 400, message: 'Sound ID must be an integer.' });
	}
	if (!['filename', 'displayname', 'source', 'count', 'association'].some(p => Object.keys(soundData).includes(p))) {
		return res.status(400).json({ code: 400, message: 'At least one property to modify must be supplied.' });
	}
	if (data.count !== undefined && isNaN(soundData.count)) {
		return res.status(400).json({ code: 400, message: 'Sound count must be an integer if provided.' });
	}
	if ((data.filename !== undefined && soundData.filename === '') || (data.count !== undefined && soundData.count === '')) {
		return res.status(400).json({ code: 400, message: 'Filename and count may not be an empty string.' });
	}

	const changedSound = sounds.find(sound => sound.id === soundData.id);
	if (!changedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Sound '${changedSound.filename}' to '${soundData.filename}' now being deleted.`);

		let columnPlaceholders = '';

		const changedProperties = Object.assign({}, soundData);
		delete changedProperties.id; // Only properties to change wanted

		Object.keys(changedProperties).forEach(k => columnPlaceholders += `${k} = ?, `);
		columnPlaceholders = columnPlaceholders.slice(0, -2); // Cut off dangling comma and whitespace

		const query = db.prepare(`UPDATE sounds SET ${columnPlaceholders} WHERE id = ?`);

		query.run(...Object.values(changedProperties), soundData.id, updateErr => {
			if (updateErr) {
				Logger.error('An error occurred updating the database entry, renaming aborted.');
				Logger.error(updateErr);
				return res.status(500).json({ code: 500, message: 'Please check the server console.' });
			}
			Logger.info(`(1/${stepAmount}): Database entry successfully updated.`);

			const oldSoundPath = `./resources/sounds/${changedSound.filename}.mp3`;
			const newSoundPath = `./resources/sounds/${soundData.filename}.mp3`;

			Object.assign(changedSound, soundData);

			Logger.info(`(2/${stepAmount}): Sound cache entry successfully updated.`);

			if (soundData.filename) {
				copyFile(oldSoundPath, `${oldSoundPath}.bak`, copyErr => {
					if (copyErr) {
						Logger.error('An error occurred backing up the original mp3 file, renaming aborted.');
						Logger.error(copyErr);
						return res.status(500).json({ code: 500, message: 'Please check the server console.' });
					}
					Logger.info(`(3/${stepAmount}): Original mp3 file successfully backed up.`);

					rename(oldSoundPath, newSoundPath, renameErr => {
						if (renameErr) {
							Logger.error('An error occurred renaming the original mp3 file, renaming aborted, restoring backup.');
							Logger.error(renameErr);
							rename(`${oldSoundPath}.bak`, oldSoundPath, backupResErr => {
								if (backupResErr) return Logger.error(`Backup restoration for the mp3 file failed.`);
							});

							return res.status(500).json({ code: 500, message: 'Please check the server console.' });
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
	}
});

apiRouter.delete('/admin/sounds/delete', (req, res) => {
	const data = req.body;

	const soundData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return soundData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return soundData[d] = data[d].trim();
		else return soundData[d] = data[d];
	});

	if (!data.id) {
		return res.status(400).json({ code: 400, message: 'Sound ID must be provided.' });
	}
	if (data.id && isNaN(soundData.id)) {
		return res.status(400).json({ code: 400, message: 'Sound ID must be an integer.' });
	}

	const deletedSound = sounds.find(sound => sound.id === soundData.id);
	if (!deletedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Sound '${deletedSound.filename}' now being deleted.`); // eslint-disable-line max-len

		const query = db.prepare('DELETE FROM sounds WHERE id = ?');
		query.run(soundData.id, deleteErr => {
			if (deleteErr) {
				Logger.error('An error occurred while deleting the database entry, deletion aborted.');
				Logger.error(deleteErr);
				return res.status(500).json({ code: 500, message: 'Please check the server console.' });
			}
			Logger.info('(1/3): Database entry successfully deleted.');

			sounds.splice(sounds.findIndex(sound => sound.id === deletedSound.id), 1);
			Logger.info('(2/3): Sound cache entry successfully deleted.');

			unlink(`./resources/sounds/${deletedSound.filename}.mp3`, unlinkErr => {
				if (unlinkErr) {
					Logger.error('An error occurred while deleting the mp3 file.');
					Logger.error(unlinkErr);
					return res.status(500).json({ code: 500, message: 'Please check the server console.' });
				}
				Logger.info('(3/3): mp3 file successfully deleted.');

				emitUpdate({
					type: 'soundDelete',
					sound: deletedSound
				});

				return res.json({ code: 200, message: 'Sound successfully deleted.', sound: deletedSound });
			});
		});
	}
});

apiRouter.post('/admin/milestones/add', (req, res) => {
	const data = req.body;
	if (!data.reached) data.reached = 0;

	const milestoneData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return milestoneData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return milestoneData[d] = data[d].trim();
		else return milestoneData[d] = data[d];
	});

	if (!data.count) {
		return res.status(400).json({ code: 400, message: 'Milestone count must be provided.' });
	}
	if (data.count && isNaN(milestoneData.count)) {
		return res.status(400).json({ code: 400, message: 'Milestone count must be an integer.' });
	}
	if ((data.reached !== undefined && isNaN(milestoneData.reached)) || (data.timestamp && isNaN(milestoneData.timestamp)) || (data.soundID && isNaN(milestoneData.soundID))) { // eslint-disable-line max-len
		return res.status(400).json({ code: 400, message: 'Milestone reached status, timestamp and soundID must be an integer if provided.' });
	}
	if (milestoneData.reached !== undefined && (milestoneData.reached !== 0 && milestoneData.reached !== 1)) {
		return res.status(400).json({ code: 400, message: 'Milestone reached status must be an integer of either 0 or 1 if provided.' });
	}
	// Checking for undefined because reached property can have value 0 which is falsy but still defined

	Logger.info(`Milestone with count ${milestoneData.count} now being added.`);

	if (milestones.find(ms => ms.count === milestoneData.count)) {
		Logger.error(`A milestone with count ${milestoneData.count} already exists, adding aborted.`);
		return res.status(400).json({ code: 400, message: 'Milestone with submitted count already exists.' });
	}
	else {
		const latestID = milestones.length ? milestones[milestones.length - 1].id : 0;
		const valuePlaceholders = '?, '.repeat(Object.keys(milestoneData).length).slice(0, -2); // Cut off dangling comma and whitespace

		const query = db.prepare(`INSERT INTO milestones ( ${Object.keys(milestoneData).join(', ')} ) VALUES ( ${valuePlaceholders} )`);
		query.run(...Object.values(milestoneData), insertErr => {
			if (insertErr) {
				Logger.error('An error occurred creating the database entry, addition aborted.');
				Logger.error(insertErr);
				const error = insertErr.code.includes('CONSTRAINT') ? 'Sound ID must match a sound on the site' : 'Please check the server console.';
				const errorCode = error.includes('ID') ? 400 : 500;

				return res.status(errorCode).json({ code: errorCode, message: error });
			}
			Logger.info('(1/2): Database entry successfully created.');

			const newMilestone = {
				id: latestID + 1,
				count: milestoneData.count,
				reached: milestoneData.reached,
				timestamp: milestoneData.timestamp || null,
				soundID: milestoneData.soundID || null
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

	const milestoneData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return milestoneData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return milestoneData[d] = data[d].trim();
		else return milestoneData[d] = data[d];
	});

	if (!data.id) {
		return res.status(400).json({ code: 400, message: 'Milestone ID must be provided.' });
	}
	if (data.id && isNaN(milestoneData.id)) {
		return res.status(400).json({ code: 400, message: 'Milestone ID must be an integer.' });
	}
	if (!['count', 'reached', 'timestamp', 'soundID'].some(p => Object.keys(milestoneData).includes(p))) {
		return res.status(400).json({ code: 400, message: 'At least one property to modify must be supplied.' });
	}
	if ((data.reached !== undefined && isNaN(milestoneData.reached)) || (data.timestamp && isNaN(milestoneData.timestamp)) || (data.soundID && isNaN(milestoneData.soundID))) { // eslint-disable-line max-len
		return res.status(400).json({ code: 400, message: 'Milestone reached status, timestamp and soundID must be an integer if provided.' });
	}
	if (milestoneData.reached !== undefined && (milestoneData.reached !== 0 && milestoneData.reached !== 1)) {
		return res.status(400).json({ code: 400, message: 'Milestone reached status must be an integer of either 0 or 1 if provided.' });
	}

	const changedMilestone = milestones.find(ms => ms.id === milestoneData.id);

	if (!changedMilestone) return res.status(404).json({ code: 404, message: 'Milestone not found.' });
	else {
		Logger.info(`Milestone ${changedMilestone.id} (${changedMilestone.count} clicks) now being modified.`);

		let columnPlaceholders = '';

		const changedProperties = Object.assign({}, milestoneData);
		delete changedProperties.id; // Only properties to change wanted

		Object.keys(changedProperties).forEach(k => columnPlaceholders += `${k} = ?, `);
		columnPlaceholders = columnPlaceholders.slice(0, -2); // Cut off dangling comma and whitespace

		const query = db.prepare(`UPDATE milestones SET ${columnPlaceholders} WHERE id = ?`);
		query.run(...Object.values(changedProperties), milestoneData.id, updateErr => {
			if (updateErr) {
				Logger.error('An error occurred updating the database entry, modification aborted.');
				Logger.error(updateErr);
				const error = updateErr.code.includes('CONSTRAINT') ? 'Sound ID must match a sound on the site' : 'Please check the server console.';
				const errorCode = error.includes('ID') ? 400 : 500;

				return res.status(errorCode).json({ code: errorCode, message: error });
			}
			Logger.info('(1/2): Database entry successfully updated.');

			Object.assign(changedMilestone, milestoneData);

			Logger.info('(2/2): Milestone cache entry successfully updated.');

			emitUpdate({
				type: 'milestoneModify',
				milestone: changedMilestone
			});

			return res.json({ code: 200, message: 'Milestone successfully modified.', milestone: changedMilestone });
		});
	}
});

apiRouter.delete('/admin/milestones/delete', (req, res) => {
	const data = req.body;

	const milestoneData = {};
	Object.keys(data).map(d => {
		if (!isNaN(parseInt(data[d]))) return milestoneData[d] = parseInt(data[d]);
		else if (typeof data[d] === 'string') return milestoneData[d] = data[d].trim();
		else return milestoneData[d] = data[d];
	});

	if (!data.id) return res.status(400).json({ code: 400, message: 'Milestone ID must be provided.' });
	if (data.id && isNaN(milestoneData.id)) return res.status(400).json({ code: 400, message: 'Milestone ID must be an integer.' });

	const deletedMilestone = milestones.find(ms => ms.id === milestoneData.id);

	if (!deletedMilestone) return res.status(404).json({ code: 404, message: 'Milestone not found.' });
	else {
		Logger.info(`Milestone ${deletedMilestone.id} (${deletedMilestone.count} clicks) now being deleted.`);

		const query = db.prepare('DELETE FROM milestones WHERE id = ?');
		query.run(milestoneData.id, deleteErr => {
			if (deleteErr) {
				Logger.error('An error occurred while deleting the database entry, deletion aborted.');
				Logger.error(deleteErr);
				return res.status(500).json({ code: 500, message: 'Please check the server console.' });
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
	}
});

apiRouter.post('/admin/notification', (req, res) => {
	const data = req.body;

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

function updateMilestone(id, timestamp, soundID) {
	const milestone = milestones.find(ms => ms.id === id);

	if (milestone) {
		Logger.info(`Milestone ${milestone.id} (${milestone.count} clicks) reached! Entry being updated.`);

		Object.assign(milestone, { reached: 1, timestamp, soundID });

		const query = db.prepare('UPDATE milestones SET reached = ?, timestamp = ?, soundID = ? WHERE id = ?');
		query.run(1, timestamp, soundID, id, updateErr => {
			if (updateErr) {
				Logger.error('An error occurred updating the milestone entry.');
				Logger.error(updateErr);
			}

			const readableCount = milestone.count.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

			emitUpdate({
				type: 'notification',
				notification: {
					text: `Milestone ${milestone.id} of ${readableCount} clicks has been reached!`,
					duration: 3
				}
			});

			return emitUpdate({
				type: 'milestoneUpdate',
				milestone
			});
		});
	}
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

			const currentDate = dateFns.format(new Date(), 'YYYY-MM-DD');
			const currentMonth = currentDate.substring(0, 7);
			const currentMonthData = chartData.find(d => d.month === currentMonth);

			++counter;
			++daily; ++weekly;
			++monthly; ++yearly;
			average = Math.round(monthly / fetchedDaysAmount);

			currentMonthData ? currentMonthData.count++ : chartData.push({ count: 1, month: currentMonth });

			statistics[currentDate] = daily;

			const reachedMilestone = milestones.filter(ms => ms.count <= counter && !ms.reached)[0];
			if (reachedMilestone) updateMilestone(reachedMilestone.id, Date.now(), soundEntry.id);

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

schedule('0 0 * * *', () => {
	daily = 0; ++fetchedDaysAmount;
	average = Math.round(monthly / fetchedDaysAmount);
	statistics[dateFns.format(new Date(), 'YYYY-MM-DD')] = 0;

	Logger.info('Daily counter reset & fetched days amount incremented.');
	return emitUpdate({
		type: 'counterUpdate',
		counter,
		statistics: {
			summary: { alltime: counter, daily, weekly, monthly, yearly, average }
		},
	});
}); // Reset daily counter and update local statistics map at each midnight