import {Router} from 'express';
import ServiceError from '../services/error';
import {setAndCheckDefaultParams} from '../utils';
import {clearFiles, checkIfExists, readFile} from '../services/fileService';
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

		const params = setAndCheckDefaultParams(req.params.queryString);
		if (params) {
			logger.log('info', `input params + set + validation = ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = createRecord(payload, params);

			if (checkIfExists(params.rejectedFile)) {
				res.status(HttpStatus.BAD_REQUEST).send(HttpStatus['400_MESSAGE']).end();
				clearFiles([params.inputFile, params.logFile]); // Leave error file?
			}

			// Get new id/s
			const id = readFile(params.logFile, true);
			if (id) {
				response.id = id;
			} else {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatus['500_MESSAGE']).end();
			}

			// TODO: remove files
			if (response.status === 200) {
				res.status(response.status).json(response.id).end();
				clearFiles([params.inputFile, params.rejectedFile, params.logFile]);
			} else {
				res.status(response.status).send(response.message).end();
				clearFiles([params.inputFile, params.rejectedFile, params.logFile]);
			}
		} else {
			res.status(HttpStatus.BAD_REQUEST).send(HttpStatus['400_MESSAGE']).end();
		}
	}
};
