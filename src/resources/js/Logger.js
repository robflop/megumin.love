const { blue, cyan, magenta, red, yellow } = require('chalk');
const { format } = require('date-fns');

class Logger {
	static info(data) {
		return console.log(`${blue(`[${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static debug(data) {
		return console.log(`${magenta(`[${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static warn(data) {
		return console.warn(`${yellow(`[${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}

	static error(data) {
		return console.error(`${red(`[${format(new Date(), 'YYYY-MM-DD HH:mm:ss')}]`)} ${cyan(data)}`);
	}
}

module.exports = Logger;