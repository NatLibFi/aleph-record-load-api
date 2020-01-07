/* eslint-disable no-unused-vars */
import {Router} from 'express';
import {setAndCheckDefaultParams} from '../utils';
import {createRecord} from '../interfaces/create';
import HttpStatus from 'http-status';
import ApiError from '../interfaces/error';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export default async () => {
	return new Router()
		.post('/', handleRequest);

	async function handleRequest(req, res, next) {
		try {
			logger.log('info', 'input router: handleRequest');
			logger.log('debug', `Query ${JSON.stringify(req.query)}`);
			const params = setAndCheckDefaultParams(req.query);
			if (params) {
				logger.log('debug', `Query params + set + validation = ${JSON.stringify(params)}`);
				const payload = req.body;
				const response = createRecord(payload, params);
				await Promise.all([response]);
				if (response.status === 200) {
					res.status(response.status).json(response.ids).end();
				}
			} else {
				throw new ApiError(HttpStatus.BAD_REQUEST, 'Aleph-record-load-api received invalid query params!');
			}
		} catch (error) {
			next(error);
		}
	}
};
