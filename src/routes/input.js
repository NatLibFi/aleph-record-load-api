import {Router} from 'express';
import ServiceError from '../services/error';
import {setAndCheckDefaultParams} from '../utils';
import {clearFiles, checkIfExists, readFile} from '../services/fileService'; // eslint-disable-line no-unused-vars
import {createRecord} from '../services/createService';
import HttpStatus from 'http-status';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export default async () => {
	return new Router()
		.post('/:queryString', handleInput)
		.use((err, req, res, next) => {
			if (err instanceof ServiceError) {
				res.status(err.status).send(err.payload);
			} else {
				next(err);
			}
		});

	async function handleInput(req, res) {
		logger.log('info', 'input router: handleInput');
		logger.log('debug', `Params ${JSON.stringify(req.params)}`);
		const params = setAndCheckDefaultParams(req.params.queryString);
		if (params) {
			logger.log('info', `input params + set + validation = ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = createRecord(payload, params);

			await Promise.all([response]);

			if (response.status === 200) {
				if (checkIfExists(params.rejectedFile)) {
					clearFiles([params.inputFile, params.logFile]); // Leave error file?
					res.status(HttpStatus.BAD_REQUEST).send(HttpStatus['400_MESSAGE']).end();
				} else {
					// Get new id/s
					const ids = readFile(params.logFile, true);
					if (ids) {
						res.status(response.status).json({ids, QUEUEID: params.QUEUEID}).end(); // Returning QUEUEID if given in parametters, used in notifying priority queue client
						clearFiles([params.rejectedFile, params.logFile]);
					} else {
						res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatus['500_MESSAGE']).end();
					}
				}
			} else {
				res.status(response.status).send(response.message).end();
				clearFiles([params.inputFile, params.rejectedFile, params.logFile]);
			}
		} else {
			res.status(HttpStatus.BAD_REQUEST).send(HttpStatus['400_MESSAGE']).end();
		}
	}
};
