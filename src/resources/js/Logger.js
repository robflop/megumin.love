const { blue, cyan, magenta, red, yellow } = require('chalk');
const moment = require('moment');

class Logger {
	static info(data) {
		return console.log(`${blue(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static debug(data) {
		return console.log(`${magenta(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static warn(data) {
		return console.warn(`${yellow(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static error(data) {
		return console.error(`${red(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}
}

module.exports = Logger;