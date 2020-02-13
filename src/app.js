import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status';
import ApiError, {Utils} from '@natlibfi/melinda-commons';
import {HTTP_PORT} from './config';
import {createAuthMiddleware, createOfflineHoursMiddleware} from './interfaces/middleware';
import {createRequestHandler} from './routes';
import {logError} from './utils';

const {createLogger, createExpressLogger, handleInterrupt} = Utils;

process.on('SIGINT', handleInterrupt);
process.on('SIGTERM', handleInterrupt);

run();

async function run() {
	const logger = createLogger(); // eslint-disable-line no-unused-vars
	logger.log('info', 'Record-load-api: node version starting');

	const app = express();

	app.use(createExpressLogger());
	app.use(createOfflineHoursMiddleware());
	app.use(createAuthMiddleware());
	app.use(bodyParser.text({limit: '5MB', type: '*/*'}));
	app.use(await createRequestHandler());

	app.use(handleError);
	app.listen(HTTP_PORT, () => logger.log('info', `Record-load-api: listenning port ${HTTP_PORT}`));

	function handleError(err, req, res, next) { // eslint-disable-line no-unused-vars
		if (err instanceof ApiError) {
			res.status(err.status).json(err.payload);
		} else {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		}

		logError(err);
	}
}
