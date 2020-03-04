import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status';
import {Error as ApiError, Utils} from '@natlibfi/melinda-commons';
import {HTTP_PORT} from './config';
import {createAuthMiddleware} from './interfaces/middleware';
import {createRequestHandler} from './routes';
import {logError} from './utils';

const {createLogger, createExpressLogger, handleInterrupt} = Utils;

run();

async function run() {
	registerInterruptionHandlers();
	const logger = createLogger(); // eslint-disable-line no-unused-vars
	logger.log('info', 'Record-load-api: node version starting');

	const app = express();

	app.use(createExpressLogger());
	app.use(createAuthMiddleware());
	app.use(bodyParser.text({limit: '5MB', type: '*/*'}));
	app.use(await createRequestHandler());

	app.use(handleError);
	app.listen(HTTP_PORT, () => logger.log('info', `Record-load-api: listenning port ${HTTP_PORT}`));

	function handleError(err, req, res, next) { // eslint-disable-line no-unused-vars
		logError(err);
		if (err instanceof ApiError) {
			return res.status(err.status).json(err.payload);
		}

		return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	}
}

function registerInterruptionHandlers() {
	process
		.on('SIGTERM', handleSignal)
		.on('SIGINT', handleInterrupt)
		.on('uncaughtException', ({stack}) => {
			handleTermination({code: 1, message: stack});
		})
		.on('unhandledRejection', ({stack}) => {
			handleTermination({code: 1, message: stack});
		});

	function handleTermination({code = 0, message}) {
		if (message) {
			logError(message);
			process.exit(code);
		}

		process.exit(code);
	}

	function handleSignal(signal) {
		handleTermination({code: 1, message: `Received ${signal}`});
	}
}
