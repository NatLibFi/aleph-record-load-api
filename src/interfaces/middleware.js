import HttpStatus from 'http-status';
import {API_KEYS, OFFLINE_BEGIN, OFFLINE_DURATION} from '../config';
import moment from 'moment';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

// Needed until the new REST API implementation is in production. Already implemented to Rest-api-importer
export function createOfflineHoursMiddleware() {
	return (req, res, next) => {
		// Test offline hours: logger.log('info', `Offline hours begin at ${OFFLINE_BEGIN} and will last next ${OFFLINE_DURATION} hours. Time is now ${moment().format('HH:mm')}`);
		const now = moment();
		const start = moment(now).startOf('day').add(OFFLINE_BEGIN, 'hours');
		const end = moment(start).add(OFFLINE_DURATION, 'hours');
		if (now.hours() < OFFLINE_BEGIN && start.format('DDD') < end.format('DDD')) { // Offline hours pass midnight (DDD = day of the year)
			start.subtract(1, 'days');
			end.subtract(1, 'days');
		}

		if (now.isBetween(start, end)) {
			res.status(HttpStatus.SERVICE_UNAVAILABLE).send(`${HttpStatus['503_MESSAGE']} Offline hours begin at ${OFFLINE_BEGIN} and will last next ${OFFLINE_DURATION} hours.`);
		} else {
			return next();
		}
	};
}

export function createAuthMiddleware() {
	return (req, res, next) => {
		if (req.headers.authorization) {
			const b64auth = (req.headers.authorization).split(' ')[1] || '';
			// Api-key is in the username slot password slot is ignored
			const [key] = Buffer.from(b64auth, 'base64').toString().split(':');

			if (API_KEYS.includes(key)) {
				return next();
			}
		}

		res.status(HttpStatus.UNAUTHORIZED).send(HttpStatus['401_MESSAGE']);
	};
}
