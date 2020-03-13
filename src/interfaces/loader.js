import {spawn} from 'child_process';
import HttpStatus from 'http-status';
import {Error as ApiError, Utils} from '@natlibfi/melinda-commons';
import {LOAD_COMMAND, LOAD_COMMAND_ENV} from '../config';
import {writeToFile, clearFiles} from './file';
import {logError} from '../utils';

export default function () {
	const {createLogger} = Utils;
	const logger = createLogger(); // eslint-disable-line no-unused-vars

	return {execute};

	function execute(payload, params) {
		logger.log('info', 'Excecuting payload');
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
			// To see in action: stdio: 'inherit' or 'ignore' to stop spamming
			const child = spawn(`/usr/bin/env\n. ${LOAD_COMMAND_ENV}\n${LOAD_COMMAND} ${values} >& ${params.processLogFilePath}`, [], {
				detached: true,
				stdio: [
					'ignore',
					'ignore',
					'ignore'
				],
				shell: '/bin/csh'
			});

			// To Local testing:
			// Simulates p_manage_18 succesfully executed operation for one record
			// WriteToFile(params.resultFilePath, '000000000FIN01\n000000001FIN01\n000000002FIN01', true);
			// WriteToFile(params.resultFilePath, '000000000FIN01', true);
			// WriteToFile(params.rejectedFilePath, '', true); // Rejected file is made but nothing is in it = succes!
			// Simulates p_manage_18 to judge one record with 2 lines as failed. For example if trying to update record that has allready been marked as deleted.
			// WriteToFile(params.rejectedFilePath, '000000000 Testing error\n000000000 Testing error', true);

			return child.pid; // Process identifier
		} catch (error) {
			logError(error);
			clearFiles([params.inputFile]); // Leave error log?
			if (error instanceof ApiError) { // eslint-disable-line functional/no-conditional-statement
				throw error;
			}

			throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
