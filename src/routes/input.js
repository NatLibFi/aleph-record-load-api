/* eslint-disable no-unused-vars */
import {Router} from 'express';
import {setAndCheckDefaultParams} from '../utils';
import {createRecord} from '../services/createService';
import HttpStatus from 'http-status';
import ServiceError from '../services/error';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export default async () => {
	return new Router()
		.post('/', handleRequest);

	async function handleRequest(req, res, next) {
		logger.log('info', 'input router: handleRequest');
		logger.log('debug', `Query ${JSON.stringify(req.query)}`);
		const params = setAndCheckDefaultParams(req.query);
		if (params) {
			logger.log('debug', `Query params + set + validation = ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = createRecord(payload, params);
			await Promise.all([response]);
			if (response === 400) {
				next(new ServiceError(HttpStatus.BAD_REQUEST, HttpStatus['400_MESSAGE']));
			} else if (response === 500) {
				next(new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus['500_MESSAGE']));
			} else {
				res.status(HttpStatus.OK).json(response.ids).end();
			}
		} else {
			next(new ServiceError(HttpStatus.BAD_REQUEST, HttpStatus['400_MESSAGE']));
		}
	}
};
