import HttpStatus from 'http-status';
import {API_KEYS, OFFLINE_PERIOD} from '../config';
import moment from 'moment';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createOfflineHoursMiddleware() {
	return (req, res, next) => {
		const times = JSON.parse(OFFLINE_PERIOD);
		logger.log('info', `Offline hours begin at ${times.start} and will last next ${times.duration} hours. Time is now ${moment().format('HH:mm')}`);
		const now = moment();
		// Moment().hours() = 0-23
		let start = moment(now).startOf('day').add(times.start, 'hours');
		let end = moment(start).add(times.duration, 'hours');
		if (now.hours() < times.start && start.format('DDD') < end.format('DDD')) { // Offline hours pass midnight
			start.subtract(1, 'days');
			end.subtract(1, 'days');
		}

		if (now.format('x') >= start.format('x') && now.format('x') < end.format('x')) {
			res.status(HttpStatus.SERVICE_UNAVAILABLE).send(HttpStatus['503_MESSAGE']).end();
		} else {
			return next();
		}
	};
}

export function createAuthMiddleware() {
	return (req, res, next) => {
		const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
		const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
		const keys = API_KEYS.split(',');
		if (keys.includes(password) && login === 'API_KEY') {
			return next();
		}

		res.status(HttpStatus.UNAUTHORIZED).send(HttpStatus['401_MESSAGE']).end();
	};
}

export function createWhitelistMiddleware(whitelist) {
	return (req, res, next) => {
		const ip = req.ip.split(/:/).pop();

		if (whitelist.some(pattern => pattern.test(ip))) {
			return next();
		}

		res.status(HttpStatus.FORBIDDEN).send(HttpStatus['403_MESSAGE']).end();
	};
}
