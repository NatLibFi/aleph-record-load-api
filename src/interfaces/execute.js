import {logError} from '../utils';
import {LOAD_COMMAND, LOAD_COMMAND_ENV} from '../config';
import {writeToFile} from './file';
import {execSync} from 'child_process';
import ApiError, {Utils} from '@natlibfi/melinda-commons';
import {clearFiles, readFile, checkIfExists} from './file';
import HttpStatus from 'http-status';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function execute(payload, params) {
	logger.log('info', 'excecute');
	try {
		// Check if result file exists (e.g. crash has happened)
		if (params.method === 'NEW' && checkIfExists(params.resultFilePath)) {
			// Read to array
			const existingRecords = readFile(params.resultFilePath, true);
			// Remove file to avoid loop (Or if later open other route just to tell clean files of specified id)
			clearFiles([params.resultFilePath]);
			// Send allready done part back to importer
			throw new ApiError(HttpStatus.CONFLICT, existingRecords);
		}

		// Write payload to input file
		writeToFile(params.inputFile, payload, true);

		// P_manage_18 arguments
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

		logger.log('info', 'Executing LOAD_COMMAND');

		// More info about process in bellow: https://nodejs.org/api/child_process.html
		// Note: If record load api crashes it also kills the child process!
		// SHELL this uses is csh
		// Load basic env's usr/bin/env
		// Load custom env variables /exlibris/aleph/a{}/alephm/.cshrc
		// Run load_command with argument
		const exLoadCommand = `/usr/bin/env
		. ${LOAD_COMMAND_ENV}
		${LOAD_COMMAND} ${values}`;

		// To see execSync in action: stdio: 'inherit' or 'ignore' to stop spamming
		execSync(exLoadCommand, {stdio: 'inherit', shell: '/bin/csh'});

		// To Local testing:
		// Simulates p_manage_18 succesfully executed operation for one record
		// writeToFile(params.resultFilePath, '000000000FIN01\n000000001FIN01\n000000002FIN01', true);
		// Simulates p_manage_18 to judge one record with 2 lines as failed. For example if trying to update record that has allready been marked as deleted.
		// writeToFile(params.rejectedFilePath, '000000000 Testing error\n000000000 Testing error', true);

		logger.log('info', 'Checking LOAD_COMMAND results');

		// Logs if something is found in rejected file and save it in bulk requests
		const rejected = readFile(params.rejectedFilePath, false);

		if (params.allRejectedFile !== null) {
			writeToFile(params.allRejectedFile, rejected, true, true);
		}

		if (rejected.length > 0) {
			logger.log('error', 'There is something in rejected');
			logger.log('error', rejected);
		}

		// Get new id/s from result file (000000001FIN01\n000000002FIN01\n000000003FIN01...)
		// as list (["000000001FIN01","000000002FIN01","000000003FIN01"...]) and save it if bulk request
		const ids = readFile(params.resultFilePath, true);

		if (params.allResultFile !== null) {
			writeToFile(params.allResultFile, ids.join('\n'), true, true);
		}

		// Return status and ids
		if (ids.length > 0) {
			return {status: HttpStatus.OK, ids};
		}

		throw new ApiError(HttpStatus.NOT_ACCEPTABLE, 'Send material produced 0 valid records');
	} catch (error) {
		logError(error);
		clearFiles([params.inputFile, params.rejectedFilePath]); // Leave error log?
		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
	}
}

