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
const db = new Database(config.databasePath);

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
			db.run(`INSERT INTO main_counter ( counter ) VALUES ( 0 )`);
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

	db.all('SELECT sum(count) AS clicks, substr(date, 1, 7) AS month FROM statistics GROUP BY month ORDER BY month ASC', [], (selectErr, rows) => {
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

/*
	Using a date iterator instead of simply looping over the statistics because I also want to fill out
	the object values for dates that are not present in the database. Looping over the statistics wouldn't
	let me grab the dates that aren't present there and using a seperate date iterator inside that loop
	would not work if the difference between current statistics iteration and date iterator is bigger than one.
*/
function filterStatistics(statisticsObject, startDate, endDate, condition) {
	let iterator = startDate;
	const filtered = {};

	if (!condition) condition = () => true; // If no condition provided, default to pass all

	while (dateFns.differenceInDays(endDate, iterator) >= 0) {
		if (!statisticsObject.hasOwnProperty(iterator)) filtered[iterator] = 0;
		// Check for days missing in statistics and insert value for those
		if (statisticsObject.hasOwnProperty(iterator) && condition(iterator)) {
			filtered[iterator] = statisticsObject[iterator];
		}

		iterator = dateFns.format(dateFns.addDays(iterator, 1), 'YYYY-MM-DD');
	}

	return filtered;
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

	if (['source', 'over', 'under', 'equals'].some(parameter => Object.keys(req.query).includes(parameter))) {
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((req.query.equals && isNaN(equals)) || (req.query.over && isNaN(over)) || (req.query.under && isNaN(under))) {
			// Check if the param was initially supplied, and if it was if the input wasn't a number
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' });
		}

		if ((over && under) && over > under) {
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' });
		}

		// Source filtering
		if (req.query.source) requestedSounds = requestedSounds.filter(sound => sound.source.toLowerCase() === req.query.source.toLowerCase());

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
	const dateRegex = new RegExp(/^(\d{4})-(\d{2})-(\d{2})$/);
	const firstStatisticsEntry = Object.keys(statistics)[0];
	const latestStatisticsEntry = Object.keys(statistics)[Object.keys(statistics).length - 1];
	// Grab latest statistics entry from the object itself instead of just today's date to make sure the entry exists

	if (['from', 'to', 'equals', 'over', 'under'].some(parameter => Object.keys(req.query).includes(parameter))) {
		if ((req.query.from && !dateRegex.test(req.query.from)) || (req.query.to && !dateRegex.test(req.query.to))) {
			return res.status(400).json({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in YYYY-MM-DD format.' });
		}

		const { from, to } = req.query;
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((to && dateFns.isAfter(to, latestStatisticsEntry)) || (from && dateFns.isAfter(from, latestStatisticsEntry))) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'Dates may not be in the future.' });
		}

		if ((to && from) && dateFns.isAfter(from, to)) {
			return res.status(400).json({ code: 400, name: 'Invalid timespan', message: 'The start date must be before the end date.' });
		}

		if ((req.query.equals && isNaN(equals)) || (req.query.over && isNaN(over)) || (req.query.under && isNaN(under))) {
			// Check if the param was initially supplied, and if it was if the input wasn't a number
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "over", "under" and "equals" parameters must be numbers.' });
		}

		if ((over && under) && over > under) {
			return res.status(400).json({ code: 400, name: 'Invalid range', message: 'The "under" parameter must be bigger than the "over" parameter.' });
		}

		// Date filtering
		if (from && !to) {
			requestedStatistics = filterStatistics(requestedStatistics, from, latestStatisticsEntry, iterator => {
				return dateFns.isWithinRange(iterator, from, latestStatisticsEntry);
			});
		}
		else if (!from && to) {
			requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, to, iterator => {
				return dateFns.isSameDay(iterator, to) || dateFns.isBefore(iterator, to);
			});
		}
		else if (from && to) {
			requestedStatistics = filterStatistics(requestedStatistics, from, to, iterator => {
				return dateFns.isWithinRange(iterator, from, to);
			});
		}

		// Count filtering
		if (equals || over || under) {
			if (equals) {
				requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry, iterator => {
					return requestedStatistics[iterator] === equals;
				});
			}
			else if (over && !under) {
				requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry, iterator => {
					return requestedStatistics[iterator] > over;
				});
			}
			else if (!over && under) {
				requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry, iterator => {
					return requestedStatistics[iterator] < under;
				});
			}
			else if (over && under) {
				requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry, iterator => {
					return requestedStatistics[iterator] > over && requestedStatistics[iterator] < under;
				});
			}

			for (const entryKey in requestedStatistics) {
				if (requestedStatistics[entryKey] === 0) delete requestedStatistics[entryKey];
			} // Remove padded entries if a count filter is used
		}
	}
	else {
		requestedStatistics = filterStatistics(requestedStatistics, firstStatisticsEntry, latestStatisticsEntry);
	}

	return res.json(requestedStatistics);
});

apiRouter.get('/statistics/milestones', (req, res) => {
	// TODO: Everything
	return res.json(milestones);
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

apiRouter.get('/statistics/chartData', (req, res) => {
	// TODO: Allow filtering via request parameters?
	return res.json(chartData);
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

apiRouter.post('/admin/upload', multer({ dest: './resources/temp' }).single('file'), (req, res) => {
	let newSound;

	if (!req.file || (req.file && !['audio/mpeg', 'audio/mp3'].includes(req.file.mimetype))) {
		if (req.file) unlink(req.file.path, delError => {
			if (delError) return Logger.error(`An error occurred deleting the temporary file '${req.file.filename}', please check manually.`, delError);
		}); // If a wrong filetype was supplied, delete the created temp file on rejection

		return res.status(400).json({ code: 400, message: 'An mp3 file must be supplied.' });
	}

	const data = req.body;
	Logger.info(`Upload process for sound '${data.filename}' (${data.displayname}, ${data.source}, ${data.association}) initiated.`);

	if (sounds.find(sound => sound.filename === data.filename)) {
		Logger.error(`A sound with filename '${data.filename}' already exists, upload aborted.`);
		return res.status(400).json({ code: 400, message: 'Sound filename already in use.' });
	}
	else {
		const latestID = sounds.length ? sounds[sounds.length - 1].id : 0;

		rename(req.file.path, `./resources/sounds/${data.filename}.mp3`, renameErr => {
			if (renameErr) return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
			else Logger.info(`(1/3): Uploaded mp3 file successfully renamed to requested filename.`);
		});

		db.run('INSERT OR IGNORE INTO sounds ( filename, displayname, source, count, association ) VALUES ( ?, ?, ?, ?, ?)',
			data.filename, data.displayname, data.source, 0, data.association,
			insertErr => {
				if (insertErr) {
					Logger.error(`An error occurred creating the database entry, upload aborted.`, insertErr);
					return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
				}
				Logger.info(`(2/3): Database entry successfully created.`);

				newSound = {
					id: latestID + 1,
					filename: data.filename,
					displayname: data.displayname,
					source: data.source,
					count: 0,
					association: data.association
				};
				sounds.push(newSound);

				Logger.info(`(3/3): Sound cache entry successfully created.`);

				emitUpdate({
					type: 'soundUpload',
					sound: newSound
				});

				return res.json({ code: 200, message: 'Sound successfully uploaded.', sound: newSound });
			}
		);
	}
});

apiRouter.patch('/admin/rename', (req, res) => {
	const data = req.body;
	const changedSound = sounds.find(sound => sound.filename === data.oldFilename);

	if (!changedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Renaming process for sound '${data.oldFilename}' to '${data.newFilename}' (${data.newDisplayname}, ${data.newSource}, ${data.newAssociation}) initiated.`); // eslint-disable-line max-len

		db.run('UPDATE sounds SET filename = ?, displayname = ?, source = ?, association = ? WHERE filename = ?',
			data.newFilename, data.newDisplayname, data.newSource, data.newAssociation, changedSound.filename,
			updateErr => {
				if (updateErr) {
					Logger.error(`An error occurred updating the database entry, renaming aborted.`, updateErr);
					return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
				}
				Logger.info(`(1/5): Database entry successfully updated.`);

				changedSound.filename = data.newFilename;
				changedSound.displayname = data.newDisplayname;
				changedSound.source = data.newSource;
				changedSound.association = data.newAssociation;

				Logger.info(`(2/5): Sound cache entry successfully updated.`);

				const oldSoundPath = `./resources/sounds/${data.oldFilename}.mp3`;
				const newSoundPath = `./resources/sounds/${data.newFilename}.mp3`;

				copyFile(oldSoundPath, `${oldSoundPath}.bak`, copyErr => {
					if (copyErr) {
						Logger.error(`An error occurred backing up the original mp3 file, renaming aborted.`, copyErr);
						return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
					}
					Logger.info(`(3/5): Original mp3 file successfully backed up.`);

					rename(oldSoundPath, newSoundPath, renameErr => {
						if (renameErr) {
							Logger.error(`An error occurred renaming the original mp3 file, renaming aborted, restoring backup.`, renameErr);
							rename(`${oldSoundPath}.bak`, oldSoundPath, backupResErr => {
								if (backupResErr) return Logger.error(`Backup restoration for the mp3 file failed.`);
							});

							return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
						}
						Logger.info(`(4/5): Original mp3 file successfully renamed.`);

						unlink(`${oldSoundPath}.bak`, unlinkErr => {
							if (unlinkErr) {
								return Logger.warn(`An error occurred deleting the original mp3 backup, please delete manually.`, unlinkErr);
							}
							Logger.info(`(5/5): Original mp3 backup successfully deleted.`);
						});
					});
				});

				emitUpdate({
					type: 'soundRename',
					sound: changedSound
				});

				return res.json({ code: 200, message: 'Sound successfully renamed.', sound: changedSound });
			});
	}
});

apiRouter.delete('/admin/delete', (req, res) => {
	const data = req.body;
	const deletedSound = sounds.find(sound => sound.filename === data.filename);

	if (!deletedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Deletion process for sound '${deletedSound.filename}' (${deletedSound.displayname}, ${deletedSound.source}, ${deletedSound.association}) initiated.`); // eslint-disable-line max-len

		db.run('DELETE FROM sounds WHERE filename = ?', deletedSound.filename, deleteErr => {
			if (deleteErr) {
				Logger.error('An error occurred while deleting the database entry, deletion aborted.', deleteErr);
				return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
			}
			Logger.info(`(1/3): Database entry successfully deleted.`);

			sounds.splice(sounds.findIndex(sound => sound.filename === deletedSound.filename), 1);
			Logger.info(`(2/3): Sound cache entry successfully deleted.`);

			unlink(`./resources/sounds/${deletedSound.filename}.mp3`, unlinkErr => {
				if (unlinkErr) {
					Logger.error(`An error occurred while deleting the mp3 file, deletion aborted.`, unlinkErr);
					return res.status(500).json({ code: 500, message: 'An unexpected error occurred. Please check the server console.' });
				}
				Logger.info(`(3/3): mp3 file successfully deleted.`);
			});

			emitUpdate({
				type: 'soundDelete',
				sound: deletedSound
			});

			return res.json({ code: 200, message: 'Sound successfully deleted.', sound: deletedSound });
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

server.use((req, res) => res.status(404).sendFile(`404.html`, { root: './pages/error/' }));
server.use((req, res) => res.status(401).sendFile(`401.html`, { root: './pages/error/' }));
server.use((req, res) => res.status(500).sendFile(`500.html`, { root: './pages/error/' }));

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

			const currentDate = dateFns.format(new Date(), 'YYYY-MM-DD');
			const currentMonth = currentDate.substring(0, 7);
			const currentMonthData = chartData.find(d => d.month === currentMonth);

			++counter;
			++daily; ++weekly;
			++monthly; ++yearly;
			average = Math.round(monthly / fetchedDaysAmount);

			currentMonthData ? currentMonthData.clicks++ : chartData.push({ clicks: 1, month: currentMonth });

			statistics[currentDate] = daily;

			// TODO: milestone functionality

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
		db.run(`UPDATE main_counter SET \`counter\` = ${counter}`);

		db.run(`INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date('now', 'localtime'), ${daily} )`);
		db.run(`UPDATE statistics SET count = ${daily} WHERE date = date('now', 'localtime')`);

		for (const sound of sounds) {
			db.run(`UPDATE sounds SET count = ${sound.count} WHERE filename = '${sound.filename}'`);
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