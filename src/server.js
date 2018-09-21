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

let counter = 0, daily = 0, weekly = 0, monthly = 0, yearly = 0, average = 0, fetchedDaysAmount = 1, chartData = {};
const sounds = [], statistics = {};

// On-boot database interaction
const db = new Database(config.databasePath);

db.serialize(() => {
	db.get('SELECT counter FROM main_counter', [], (selectErr, row) => {
		if (!row) db.run(`INSERT INTO main_counter ( counter ) VALUES ( 0 )`);
		// Only assume there's no proper counter entry if counter hasn't already been set above
		if (row) counter = row.counter;

		return Logger.info('Main counter loaded.');
	});

	db.all('SELECT * FROM sounds', [], (selectErr, rows) => {
		rows.map(sound => sounds.push(sound));
		return Logger.info('Sounds & rankings loaded.');
	});

	db.run('INSERT OR IGNORE INTO statistics ( date, count ) VALUES ( date( \'now\', \'localtime\'), 0 )');
	// Statistics entry for the boot day

	db.all('SELECT * FROM statistics', [], (selectErr, rows) => {
		const startOfBootWeek = dateFns.addDays(dateFns.startOfWeek(new Date()), 1), endOfBootWeek = dateFns.addDays(dateFns.endOfWeek(new Date()), 1);
		// Add 1 day because I don't believe sunday to be the start of the week
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
		chartData = rows;
		return Logger.info('Chart data loaded.');
	});
});

// Webserver
const server = express();
const http = require('http').Server(server);
const maintenanceMode = (process.argv.slice(2)[0] || '') === '--maintenance' ? true : false; // eslint-disable-line no-unneeded-ternary

const pagePath = join(__dirname, '/pages');
const errorPath = join(pagePath, '/errorTemplates');
const pages = [];

readdirSync(pagePath).forEach(file => {
	const page = file.slice(0, -5).toLowerCase();
	if (file.substr(-5, 5) !== '.html' || config.errorTemplates.includes(page)) return;

	pages.push({
		name: file,
		path: join(pagePath, file),
		route: [`/${page}`, `/${page}.html`]
	});

	if (page === 'index') pages[pages.length - 1].route.push('/');
	// Last array item because during current iteration it will be the last (adds root-dir route for index)
});

server.use(helmet({
	hsts: false // HSTS sent via nginx
}));
server.set('trust proxy', 1);
server.use(express.urlencoded({ extended: false }));
server.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: 'auto' }
}));
server.use(express.static('./resources'));

const upload = multer({
	dest: './resources/temp/',
	storage: multer.diskStorage({
		destination: './resources/sounds',
		filename(req, file, cb) {
			if (file.mimetype === 'audio/ogg') return cb(null, `${req.body.filename}.ogg`);
			else if (['audio/mpeg', 'audio/mp3'].includes(file.mimetype)) return cb(null, `${req.body.filename}.mp3`);
			else return cb(null, false);
		}
	}),
	fileFilter(req, file, cb) {
		if (!['audio/mpeg', 'audio/mp3', 'audio/ogg'].includes(file.mimetype)) return cb('Only mp3 and ogg files are accepted.');
		return cb(null, true);
	}
}).array('files[]', 2);

/*
	Using a date iterator instead of simply looping over the statistics because I also want to fill out
	the object values for dates that are not present in the database. Looping over the stats wouldn't
	let me grab the dates that aren't present there and using a seperate date iterator inside that loop
	would not work if the difference between current stats iteration and date iterator is bigger than one.
*/
function filterStats(statsObj, startDate, endDate, statsCondition) {
	let iterator = startDate;
	const result = {};

	if (!statsCondition) statsCondition = () => true; // If no condition provided default to true

	while (dateFns.differenceInDays(endDate, iterator) >= 0) {
		if (!statsObj.hasOwnProperty(iterator)) result[iterator] = 0;
		// Check for days missing in statistics and insert value for those
		if (statsObj.hasOwnProperty(iterator) && statsCondition(iterator, startDate, endDate)) {
			result[iterator] = statsObj[iterator];
		}

		iterator = dateFns.format(dateFns.addDays(iterator, 1), 'YYYY-MM-DD');
	}

	return result;
}

http.listen(config.port, () => {
	const options = `${config.SSLproxy ? ' (Proxied to SSL)' : ''}${maintenanceMode ? ' (in Maintenance mode!)' : ''}`;
	return Logger.info(`megumin.love booting on port ${config.port}...${options}`);
});

server.all(['/api/', '/api/*'], (req, res, next) => {
	const apiRoutes = server._router.stack.filter(st => {
		if (!st.route) return false;

		if (typeof st.route.path === 'object') return st.route.path.every(p => p.startsWith('/api')) ? true : false;
		else return st.route.path.startsWith('/api') ? true : false;
	}).map(r => r.route.path);

	if (!apiRoutes.includes(req.path)) return res.status(404).json({ code: 404, message: 'Route not found.' });
	else return next();
});

server.get('/api/conInfo', (req, res) => {
	return res.json({ port: config.port, ssl: config.SSLproxy });
});

server.get('/api/counter', (req, res) => {
	return res.json({ counter });
});

server.get('/api/sounds', (req, res) => { // eslint-disable-line complexity
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

server.get('/api/statistics', (req, res) => { // eslint-disable-line complexity
	let requestedStats = statistics;
	const dateRegex = new RegExp(/^(\d{4})-(\d{2})-(\d{2})$/);
	const firstStatDate = Object.keys(statistics)[0];
	const latestStatDate = Object.keys(statistics)[Object.keys(statistics).length - 1];
	// Grab latest statistics entry from the object itself instead of just today's date to make sure the entry exists

	if (['from', 'to', 'equals', 'over', 'under'].some(parameter => Object.keys(req.query).includes(parameter))) {
		if ((req.query.from && !dateRegex.test(req.query.from)) || (req.query.to && !dateRegex.test(req.query.to))) {
			return res.status(400).json({ code: 400, name: 'Wrong Format', message: 'Dates must be provided in YYYY-MM-DD format.' });
		}

		const { to, from } = req.query;
		const [equals, over, under] = [parseInt(req.query.equals), parseInt(req.query.over), parseInt(req.query.under)];

		if ((to && dateFns.isAfter(to, latestStatDate)) || (from && dateFns.isAfter(from, latestStatDate))) {
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
			requestedStats[from] = requestedStats[from] || 0;
		}
		else if (!from && to) {
			requestedStats = filterStats(requestedStats, firstStatDate, to, (iterator, startDate, endDate) => {
				return dateFns.isSameDay(iterator, endDate) || dateFns.isBefore(iterator, endDate);
			});
		}
		else if (from && to) {
			requestedStats = filterStats(requestedStats, from, to, (iterator, startDate, endDate) => {
				return dateFns.isWithinRange(iterator, startDate, endDate);
			});
		}

		// Count filtering
		if (equals || over || under) {
			if (equals) {
				requestedStats = filterStats(requestedStats, firstStatDate, latestStatDate, (iterator, startDate, endDate) => {
					return requestedStats[iterator] === equals;
				});
			}
			else if (over && !under) {
				requestedStats = filterStats(requestedStats, firstStatDate, latestStatDate, (iterator, startDate, endDate) => {
					return requestedStats[iterator] > over;
				});
			}
			else if (!over && under) {
				requestedStats = filterStats(requestedStats, firstStatDate, latestStatDate, (iterator, startDate, endDate) => {
					return requestedStats[iterator] < under;
				});
			}
			else if (over && under) {
				requestedStats = filterStats(requestedStats, firstStatDate, latestStatDate, (iterator, startDate, endDate) => {
					return requestedStats[iterator] > over && requestedStats[iterator] < under;
				});
			}

			for (const entryKey in requestedStats) {
				if (requestedStats[entryKey] === 0) delete requestedStats[entryKey];
			} // Filter padded entries if a count filter is used
		}
	}
	else {
		requestedStats = filterStats(requestedStats, firstStatDate, latestStatDate);
	}

	return res.json(requestedStats);
});

server.get('/api/statistics/summary', (req, res) => {
	return res.json({
		alltime: counter,
		daily,
		weekly,
		monthly,
		yearly,
		average
	});
});

server.get('/api/statistics/chartData', (req, res) => {
	return res.json(chartData);
});

server.post('/api/login', (req, res) => {
	if (req.session.loggedIn) {
		return res.status(401).json({ code: 401, message: 'Already logged in.' });
	}

	if (config.adminPassword === req.body.password) {
		req.session.loggedIn = true;
		Logger.info('A user has logged into the admin panel.');
		return res.json({ code: 200, message: 'Successfully logged in!' });
	}
	else {
		return res.status(401).json({ code: 401, message: 'Invalid password provided.' });
	}
});

server.all(['/api/admin/', '/api/admin/*'], (req, res, next) => {
	if (!req.session.loggedIn) return res.status(401).json({ code: 401, message: 'Not logged in.' });
	else return next();
});

server.get('/api/admin/logout', (req, res) => {
	req.session.destroy();
	Logger.info('A user has logged out of the admin panel.');
	return res.json({ code: 200, message: 'Successfully logged out!' });
});

server.post('/api/admin/upload', (req, res) => {
	let newSound;

	upload(req, res, uploadErr => {
		if (uploadErr) return res.status(400).json({ code: 400, message: uploadErr });

		const data = req.body;
		Logger.info(`Upload process for sound '${data.filename}' initiated.`);

		if (sounds.find(sound => sound.filename === data.filename)) {
			Logger.error(`Sound with filename '${data.filename}' already exists, upload aborted.`);
			return res.status(400).json({ code: 400, message: 'Sound filename already in use.' });
		}
		else {
			let step = 0;
			const latestID = sounds.length ? sounds[sounds.length - 1].id : 0;

			db.run('INSERT OR IGNORE INTO sounds ( filename, displayname, source, count ) VALUES ( ?, ?, ?, ? )',
				data.filename, data.displayname, data.source, 0,
				insertErr => {
					if (insertErr) {
						Logger.error(`An error occurred creating the database entry, upload aborted.`, insertErr);
						return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
					}
					Logger.info(`(${++step}/2) Database entry successfully created.`);

					newSound = { id: latestID + 1, filename: data.filename, displayname: data.displayname, source: data.source, count: 0 };
					sounds.push(newSound);

					Logger.info(`(${++step}/2) Rankings/Sound cache successfully entry created.`);

					setTimeout(() => {
						emitUpdate({
							type: 'soundUpdate',
							sounds: { addedSounds: [newSound], changedSounds: [], deletedSounds: [] }
						});
					}, 1000 * 0.5); // Allow time for server to keep up and send actual new data

					return res.json({ code: 200, message: 'Sound successfully uploaded.', sound: newSound });
				});
		}
	});
});

server.post('/api/admin/rename', (req, res) => {
	const data = req.body;
	const changedSound = sounds.find(sound => sound.filename === data.oldFilename);

	if (!changedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Renaming process for sound '${data.oldFilename}' to '${data.newFilename}' (${data.newDisplayname}, ${data.newSource}) initiated.`);
		let step = 0;

		db.run('UPDATE sounds SET filename = ?, displayname = ?, source = ? WHERE filename = ?',
			data.newFilename, data.newDisplayname, data.newSource, changedSound.filename,
			updateErr => {
				if (updateErr) {
					Logger.error(`An error occurred updating the database entry, renaming aborted.`, updateErr);
					return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
				}
				Logger.info(`(${++step}/8) Database entry successfully updated.`);

				changedSound.filename = data.newFilename;
				changedSound.displayname = data.newDisplayname;
				changedSound.source = data.newSource;

				Logger.info(`(${++step}/8) Rankings/Sound cache entry successfully updated.`);

				['ogg', 'mp3'].map(ext => { // eslint-disable-line arrow-body-style
					const oldSoundPath = `./resources/sounds/${data.oldFilename}.${ext}`;
					const newSoundPath = `./resources/sounds/${data.newFilename}.${ext}`;

					return copyFile(oldSoundPath, `${oldSoundPath}.bak`, copyErr => {
						if (copyErr) {
							Logger.error(`An error occurred backing up the original ${ext} file, renaming aborted.`, copyErr);
							return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
						}
						Logger.info(`(${++step}/8) Original ${ext} soundfile successfully backed up.`);

						rename(oldSoundPath, newSoundPath, renameErr => {
							if (renameErr) {
								Logger.error(`An error occurred renaming the original ${ext} soundfile, renaming aborted, restoring backup.`, renameErr);
								rename(`${oldSoundPath}.bak`, oldSoundPath, backupResErr => {
									if (backupResErr) return Logger.error(`Backup restoration for the ${ext} soundfile failed.`);
								});

								return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
							}
							Logger.info(`(${++step}/8) Original ${ext} soundfile successfully renamed.`);

							unlink(`${oldSoundPath}.bak`, unlinkErr => {
								if (unlinkErr) {
									return Logger.error(`An error occurred deleting the original ${ext} soundfile backup, please check manually.`, unlinkErr);
								}
								Logger.info(`(${++step}/8) Original ${ext} soundfile backup successfully deleted.`);
							});
						});
					});
				});
				setTimeout(() => {
					emitUpdate({
						type: 'soundUpdate',
						sounds: { changedSounds: [changedSound], addedSounds: [], deletedSounds: [] }
					});
				}, 1000 * 0.5); // Allow time for server to keep up and send actual new data

				return res.json({ code: 200, message: 'Sound successfully renamed.', sound: changedSound });
			});
	}
});

server.post('/api/admin/delete', (req, res) => {
	const data = req.body;
	const deletedSound = sounds.find(sound => sound.filename === data.soundFilename);

	if (!deletedSound) return res.status(404).json({ code: 404, message: 'Sound not found.' });
	else {
		Logger.info(`Deletion process for sound '${deletedSound.filename}' initiated.`);
		let step = 0;

		db.run('DELETE FROM sounds WHERE filename = ?', deletedSound.filename, deleteErr => {
			if (deleteErr) {
				Logger.error('An error occurred while deleting the database entry, deletion aborted.', deleteErr);
				return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
			}
			Logger.info(`(${++step}/4) Database entry successfully deleted.`);

			['ogg', 'mp3'].map(ext => { // eslint-disable-line arrow-body-style
				return unlink(`./resources/sounds/${deletedSound.filename}.${ext}`, unlinkErr => {
					if (unlinkErr) {
						Logger.error(`An error occurred while deleting the ${ext} soundfile, deletion aborted.`, unlinkErr);
						return res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
					}
					Logger.info(`(${++step}/4) ${ext} soundfile successfully deleted.`);
				});
			});

			sounds.splice(sounds.findIndex(sound => sound.filename === deletedSound.filename), 1);
			Logger.info(`(${++step}/4) Rankings/Sound cache entry successfully deleted.`);

			setTimeout(() => {
				emitUpdate({
					type: 'soundUpdate',
					sounds: { deletedSounds: [deletedSound], changedSounds: [], addedSounds: [] }
				});
			}, 1000 * 0.5); // Allow time for server to keep up and send actual new data

			return res.json({ code: 200, message: 'Sound successfully deleted.', sound: deletedSound });
		});
	}
});

server.post('/api/admin/notification', (req, res) => {
	const data = req.body;

	Logger.info(`Announcement with text '${data.text}' displayed for ${data.duration} seconds.`);
	emitUpdate({
		type: 'notification',
		notification: data
	});
	return res.json({ code: 200, message: 'Notification sent.' });
});

if (!maintenanceMode) {
	for (const page of pages) {
		if (page.name === 'admin.html') {
			server.get(page.route, (req, res) => {
				if (!req.session.loggedIn) return res.sendFile(page.path.replace('admin', 'login'));
				else return res.sendFile(page.path);
			});
			continue;
		}
		server.get(page.route, (req, res) => res.sendFile(page.path));
	}
}

for (const error of config.errorTemplates) {
	if (maintenanceMode) {
		return server.get(/.*/, (req, res) => res.status(503).sendFile('503.html', { root: errorPath }));
	}
	else {
		server.use((req, res) => res.status(error).sendFile(`${error}.html`, { root: errorPath }));
	}
}

// Socket server
const socketServer = new uws.Server({ server: http });

function emitUpdate(eventData, options = {}) {
	if (options.excludeSocket) {
		return socketServer.clients.forEach(socket => {
			if (socket === options.excludeSocket) return; // eslint-disable-line no-useless-return
			else return socket.send(JSON.stringify(eventData));
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
			const crazyModeSound = data.soundFilename ? sounds.find(s => s.filename === data.soundFilename) : null;

			if (!crazyModeSound) return;

			const currentDate = dateFns.format(new Date(), 'YYYY-MM-DD');
			const currentMonth = currentDate.substring(0, 7);
			const currentMonthData = chartData.find(d => d.month === currentMonth);
			++counter;
			++daily; ++weekly;
			++monthly; ++yearly;
			average = Math.round(monthly / fetchedDaysAmount);

			currentMonthData ? currentMonthData.clicks++ : chartData.push({ clicks: 1, month: currentMonth });

			statistics[currentDate] = daily;

			emitUpdate({
				type: 'crazyMode',
				soundFilename: crazyModeSound.filename
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
				type: 'soundUpdate',
				sounds: { changedSounds: [soundEntry], addedSounds: [], deletedSounds: [] }
			});
		}
	});

	socket.on('close', (code, reason) => {
		clearInterval(socket.pingInterval);
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
}); // Reset weekly counter at the start of each week (1 = monday)

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