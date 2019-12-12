import HttpStatus from 'http-status';
import {API_KEYS} from '../config';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createAuthMiddleware() {
	return (req, res, next) => {
		const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
		const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
		const keys = API_KEYS.split(',');
		if (keys.includes(password) && login === 'HTTP_AUTHORIZATION') {
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
