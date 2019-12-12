/* eslint-disable no-unused-vars */
import express, {Router} from 'express';
import ServiceError from '../services/error';
import {setAndCheckDefaultParams} from '../utils';
import {createRecord} from '../services/createService';
import HttpStatus from 'http-status';

import {
	ALEPH_VERSION, LOAD_COMMAND, LOCKFILE_PATH
} from '../config';

import {Utils} from '@natlibfi/melinda-commons';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export default async () => {
	// TODO: AuthService as middleware -> listen post
	// TODO: Payload handling..? FILE? JSON?
	return new Router()
		.post('/:queryString', handleInput)
		.use((err, req, res, next) => {
			if (err instanceof ServiceError) {
				res.status(err.status).send(err.payload);
			} else {
				next(err);
			}
		});

	async function handleInput(req, res, next) {
		logger.log('info', 'input router: handleInput');

		const params = setAndCheckDefaultParams(req.params.queryString);
		if (params) {
			logger.log('info', `input params + set + validation = ${JSON.stringify(params)}`);
			const payload = req.body;
			const response = createRecord(payload, params);

			// TODO: remove files
			if (response.status === 200) {
				res.status(response.status).json(response).end();
			} else {
				res.status(response.status).send(response.message).end();
			}
		} else {
			res.status(HttpStatus.BAD_REQUEST).send(HttpStatus['400_MESSAGE']).end();
		}
	}
};
