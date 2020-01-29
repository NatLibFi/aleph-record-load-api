import {logError} from '../utils';
import {LOAD_COMMAND, LOAD_COMMAND_ENV} from '../config';
import {writeToFile} from './file';
import {execSync} from 'child_process';
import ApiError, {Utils} from '@natlibfi/melinda-commons';
import {clearFiles, readFile} from './file';
import HttpStatus from 'http-status';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createRecord(payload, params) {
	logger.log('info', 'create: createRecord');

	try {
		// Write input file
		writeToFile(params.inputFile, payload, true);

		const values = [
			params.library,
			params.inputFile,
			params.rejectedFile,
			params.resultFile,
			params.method,
			params.fixRoutine,
			'',
			params.indexing,
			params.updateAction,
			params.mode,
			params.charConversion,
			params.mergeRoutine,
			params.cataloger,
			params.catalogerLevel,
			params.indexingPriority
		];

		logger.log('debug', 'Executing LOAD_COMMAND');

		// More info about process in bellow: https://nodejs.org/api/child_process.html
		// SHELL this uses is csh
		// Load basic env's usr/bin/env
		// Load custom env variables /exlibris/aleph/a{}/alephm/.cshrc
		// Run load_command with argument
		const exLoadCommand = `/usr/bin/env
		. ${LOAD_COMMAND_ENV}
		${LOAD_COMMAND} ${values}`;

		// To see execSync in action: stdio: 'inherit' or 'ignore' to stop spamming
		execSync(exLoadCommand, {stdio: 'ignore', shell: '/bin/csh'});

		// To Local testing:
		// Simulates p_manage_18 succesfully executed operation for one record
		// writeToFile(params.resultFilePath, '000000000', true);
		// Simulates p_manage_18 to judge one record with 2 lines as failed. For example if trying to update record that has allready been marked as deleted.
		// writeToFile(params.rejectedFilePath, '000000000 Testing error\n000000000 Testing error', true);

		logger.log('debug', 'Checking LOAD_COMMAND results');

		// Logs if something is found in rejected file
		const rejected = readFile(params.rejectedFilePath, false);
		if (rejected.length > 0) {
			logger.log('error', 'There is something in rejected');
			logger.log('error', rejected);
		}

		// Get new id/s from result file (000000001FIN01\n000000002FIN01\n000000003FIN01...) as list (["000000001FIN01","000000002FIN01","000000003FIN01"...])
		const ids = readFile(params.resultFilePath, true);
		if (ids.length > 0) {
			return {status: HttpStatus.OK, ids};
		}

		throw new ApiError(HttpStatus.NOT_ACCEPTABLE, 'Send material produced 0 valid records');
	} catch (err) {
		logError(err);
		clearFiles([params.inputFile, params.rejectedFilePath, params.resultFilePath]);
		throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
	}
}

