/* eslint-disable no-unused-vars */
import {Router} from 'express';
import {Utils} from '@natlibfi/melinda-commons';
import {setParams} from '../utils';
import {createRecord} from '../interfaces/create';
import {clearFiles} from '../interfaces/file';

const {createLogger} = Utils;

export default async () => {
	const logger = createLogger(); // eslint-disable-line no-unused-vars

	return new Router()
		.post('/', handleRequest);

	async function handleRequest(req, res, next) {
		try {
			logger.log('info', 'router: handleRequest');
			logger.log('debug', `Query ${JSON.stringify(req.query)}`);
			const params = setParams(req.query);

			logger.log('debug', `Query params set: ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = createRecord(payload, params);
			await Promise.all([response]);
			logger.log('debug', response);

			res.status(response.status).json(response.data).end();

			// Cleaning
			clearFiles([params.inputFile, params.rejectedFilePath, params.resultFilePath]);
		} catch (error) {
			next(error);
		}
	}
};
