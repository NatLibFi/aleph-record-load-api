import {Router} from 'express';
import {Error, Utils} from '@natlibfi/melinda-commons';
import {setExecutionParams, setCheckParams} from '../utils';
import loader from '../interfaces/loader';
import {checkProcessStatus} from '../interfaces/check';
import {clearFiles} from '../interfaces/file'; // eslint-disable-line no-unused-vars
import httpStatus from 'http-status';

const {createLogger} = Utils;

export default async () => {
	const logger = createLogger(); // eslint-disable-line no-unused-vars
	const loaderOperator = loader();

	return new Router()
		.post('/', handleRequest)
		.get('/', checkProcess)
		.delete('/', requestClearFiles);

	async function handleRequest(req, res, next) {
		try {
			logger.log('info', 'router: handleRequest');

			// Should be changed to application/alephseq?
			if (req.headers['content-type'] !== 'text/plain') {
				throw new Error(httpStatus.UNSUPPORTED_MEDIA_TYPE);
			}

			logger.log('debug', `Query ${JSON.stringify(req.query)}`);
			const params = setExecutionParams(req.query);

			logger.log('debug', `Query params set: ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = loaderOperator.execute(payload, params);
			await Promise.all([response]);

			// Lets keep correlation id with us! It helps to find process files!
			response.correlationId = params.correlationId;
			response.pLogFile = params.allResultFile;
			response.pRejectFile = params.allRejectedFile;

			logger.log('debug', 'response:');
			logger.log('debug', JSON.stringify(response));

			res.status(httpStatus.OK).json(response);
		} catch (error) {
			next(error);
		}
	}

	async function checkProcess(req, res, next) {
		try {
			logger.log('info', 'router: checkProcess');

			if (req.headers['content-type'] !== 'text/plain') {
				throw new Error(httpStatus.UNSUPPORTED_MEDIA_TYPE);
			}

			logger.log('debug', `Query ${JSON.stringify(req.query)}`);
			const params = setCheckParams(req.query);

			const response = await checkProcessStatus(params);

			if (response.status === httpStatus.LOCKED) {
				return res.sendStatus(httpStatus.LOCKED);
			}

			logger.log('debug', 'response:');
			logger.log('debug', JSON.stringify(response));

			res.status(response.status).json(response.payload);
		} catch (error) {
			next(error);
		}
	}

	async function requestClearFiles(req, res, next) {
		try {
			logger.log('info', 'router: checkProcess');

			if (req.headers['content-type'] !== 'text/plain') {
				throw new Error(httpStatus.UNSUPPORTED_MEDIA_TYPE);
			}

			logger.log('debug', `Query ${JSON.stringify(req.query)}`);
			const params = setCheckParams(req.query);

			// Cleaning
			clearFiles([params.inputFile, params.rejectedFilePath, params.resultFilePath, params.processLogFilePath]);

			res.sendStatus(httpStatus.NO_CONTENT);
		} catch (error) {
			next(error);
		}
	}
};
