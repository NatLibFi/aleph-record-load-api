import HttpStatus from 'http-status';
import {API_KEYS, OFFLINE_PERIOD} from '../config';
import moment from 'moment';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createOfflineHoursMiddleware() {
	return (req, res, next) => {
		const times = OFFLINE_PERIOD.split(',');
		logger.log('info', `Offline hours begin at ${times[0]} and will last next ${times[1]} hours. Time is now ${moment().format('HH:mm')}`);
		const now = moment();
		let start = moment(now).startOf('day').add(times[0], 'hours');
		let end = moment(start).add(times[1], 'hours');
		if (now.hours() < times[0] && start.format('DDD') < end.format('DDD')) { // Offline hours pass midnight (DDD = day of the year)
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
