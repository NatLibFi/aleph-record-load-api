import HttpStatus from 'http-status';
import {API_KEYS, OFFLINE_PERIOD} from '../config';
import moment from 'moment';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createOfflineHoursMiddleware() {
	return (req, res, next) => {
		const [begin, duration] = OFFLINE_PERIOD.split(',');
		logger.log('info', `Offline hours begin at ${begin} and will last next ${duration} hours. Time is now ${moment().format('HH:mm')}`);
		const now = moment();
		const start = moment(now).startOf('day').add(begin, 'hours');
		const end = moment(start).add(duration, 'hours');
		if (now.hours() < begin && start.format('DDD') < end.format('DDD')) { // Offline hours pass midnight (DDD = day of the year)
			start.subtract(1, 'days');
			end.subtract(1, 'days');
		}

		if (now.format('x') >= start.format('x') && now.format('x') < end.format('x')) {
			res.status(HttpStatus.SERVICE_UNAVAILABLE).send(`${HttpStatus['503_MESSAGE']} Offline hours begin at ${begin} and will last next ${duration} hours.`).end();
		} else {
			return next();
		}
	};
}

export function createAuthMiddleware() {
	return (req, res, next) => {
		const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
		const [key] = Buffer.from(b64auth, 'base64').toString().split(':');

		if (API_KEYS.includes(key)) {
			return next();
		}

		res.status(HttpStatus.UNAUTHORIZED).send(HttpStatus['401_MESSAGE']).end();
	};
}
