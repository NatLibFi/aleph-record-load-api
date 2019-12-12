import express from 'express';
import {Utils} from '@natlibfi/melinda-commons';
import HttpStatus from 'http-status';
import {createWhitelistMiddleware, createAuthMiddleware} from './services/authService';
import bodyParser from 'body-parser';

import {createInputRouter} from './routes';

import {HTTP_PORT, IP_FILTER} from './config';

const {createLogger, createExpressLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

process.on('SIGINT', () => {
	process.exit(1);
});

run();

async function run() {
	logger.log('info', 'Record-load-api: node version starting');

	const ipFilterList = JSON.parse(IP_FILTER).map(rule => new RegExp(rule));
	const app = express();

	app.use(createExpressLogger());
	app.use(createWhitelistMiddleware(ipFilterList));
	app.use(createAuthMiddleware());
	app.use(bodyParser.text({limit: '5MB', type: '*/*'}));
	app.use('/input', await createInputRouter());

	app.use(handleError);

	app.listen(HTTP_PORT, () => logger.log('info', `Record-load-api listening on port ${HTTP_PORT}!`));

	function handleError(err, req, res, next) {
		if (res.headersSent) {
			return next(err);
		}

		console.log(err.stack);
		res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
