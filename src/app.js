import express from 'express';
import {Utils} from '@natlibfi/melinda-commons';
import HttpStatus from 'http-status';
import {createAuthMiddleware, createOfflineHoursMiddleware} from './interfaces/middleware';
import bodyParser from 'body-parser';
import {createInputRouter} from './routes';
import ApiError from './interfaces/error';

import {HTTP_PORT} from './config';
import {logError} from './utils';

const {createLogger, createExpressLogger, handleInterrupt} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

process.on('SIGINT', handleInterrupt);
process.on('SIGTERM', handleInterrupt);

run();

async function run() {
	logger.log('info', 'Record-load-api: node version starting');

	const app = express();

	app.use(createExpressLogger());
	app.use(createOfflineHoursMiddleware());
	app.use(createAuthMiddleware());
	app.use(bodyParser.text({limit: '5MB', type: '*/*'}));
	app.use(await createInputRouter());

	app.use(handleError);
	app.listen(HTTP_PORT, () => logger.log('info', `Record-load-api: listenning port ${HTTP_PORT}`));

	function handleError(err, req, res) {
		if (err instanceof ApiError) {
			res.status(err.status).send(err.payload).end();
		} else {
			res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		}

		logError(err);
	}
}
