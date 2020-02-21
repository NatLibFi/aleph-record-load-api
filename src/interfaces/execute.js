import {logError} from '../utils';
import {LOAD_COMMAND, LOAD_COMMAND_ENV} from '../config';
import {writeToFile} from './file';
import {spawn} from 'child_process';
import ApiError, {Utils} from '@natlibfi/melinda-commons';
import {clearFiles} from './file';
import HttpStatus from 'http-status';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function execute(payload, params) {
	logger.log('info', 'excecute');
	try {
		// Write payload to input file
		writeToFile(params.inputFile, payload, true);

		// P_manage_18 arguments
		const values = [
			params.pActiveLibrary,
			params.inputFile,
			params.rejectedFile,
			params.resultFile,
			params.pOldNew,
			params.pFixType,
			'',
			params.pUpdateF,
			params.pUpdateType,
			params.pUpdateMode,
			params.pCharConv,
			params.pMergeType,
			params.pCatalogerIn,
			params.pCatalogerLevelX,
			params.pZ07PriorityYear
		];

		logger.log('info', 'Executing LOAD_COMMAND');

		// More info about process in bellow: https://nodejs.org/api/child_process.html
		// Note: If record load api crashes it also kills the child process!
		// SHELL this uses is csh
		// Load basic env's usr/bin/env
		// Load custom env variables /exlibris/aleph/a{}/alephm/.cshrc
		// Run load_command with argument and output log to file
		const exLoadCommand = `/usr/bin/env
		. ${LOAD_COMMAND_ENV}
		${LOAD_COMMAND} ${values} >& ${params.processLogFilePath}`;

		// To see in action: stdio: 'inherit' or 'ignore' to stop spamming
		const child = spawn(exLoadCommand, [], {
			detached: true,
			stdio: ['ignore', 'ignore', 'ignore'],
			shell: '/bin/csh'
		});
		const processId = child.pid; // Process identifier

		// To Local testing:
		// Simulates p_manage_18 succesfully executed operation for one record
		// writeToFile(params.resultFilePath, '000000000FIN01\n000000001FIN01\n000000002FIN01', true);
		// writeToFile(params.resultFilePath, '000000000FIN01', true);
		// Simulates p_manage_18 to judge one record with 2 lines as failed. For example if trying to update record that has allready been marked as deleted.
		// writeToFile(params.rejectedFilePath, '000000000 Testing error\n000000000 Testing error', true);

		return {processId};
	} catch (error) {
		logError(error);
		clearFiles([params.inputFile]); // Leave error log?
		if (error instanceof ApiError) {
			throw error;
		}

		throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
	}
}

