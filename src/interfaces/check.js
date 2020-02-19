import ApiError, {Utils} from '@natlibfi/melinda-commons';
import {readFile, clearFiles, checkIfExists, writeToFile} from './file';
import {exec} from 'child_process';
import HttpStatus from 'http-status';

export async function checkProcessStatus(params) {
	const {createLogger} = Utils;
	const logger = createLogger(); // eslint-disable-line no-unused-vars

	logger.log('debug', 'Checking prosess status');
	// Console.log(params);

	// "Sanitize" length of input (HUGE RISK IF NOT DONE!)
	const processId = params.processId;

	// Check if process exists
	const found = await checkProcess(processId);
	logger.log('debug', `Process found: ${found}`);

	if (found) {
		return {status: 423};
	}

	// Read to array
	const processLog = readFile(params.processLogFilePath, true);
	const lastLine = processLog[processLog.length - 2];

	console.log('last line: ' + lastLine);

	if (lastLine === 'end') {
		logger.log('info', 'LOAD_COMMAND succesfull');
		logger.log('info', 'Checking LOAD_COMMAND results');

		// Logs if something is found in rejected file and save it in bulk requests
		const rejected = readFile(params.rejectedFilePath, false);
		if (rejected.length > 0) {
			logger.log('error', 'There is something in rejected');
			logger.log('error', rejected);

			if (params.allRejectedFile !== null) {
				writeToFile(params.allRejectedFile, rejected, true, true);
			}
		}

		// Get id/s from result file (000000001FIN01\n000000002FIN01\n000000003FIN01...)
		// as list (["000000001FIN01","000000002FIN01","000000003FIN01"...]) and save it if bulk request
		const ids = readFile(params.resultFilePath, true);
		console.log(ids);

		// Return status and ids
		if (ids.length > 0) {
			if (params.allResultFile !== null) {
				console.log('writing all log');
				writeToFile(params.allResultFile, ids.join('\n'), true, true);
			}

			return {status: HttpStatus.OK, payload: ids};
		}

		throw new ApiError(HttpStatus.NOT_ACCEPTABLE, 'Send material produced 0 valid records');
	}

	// Check if result file exists (e.g. crash has happened)
	if (checkIfExists(params.resultFilePath)) {
		// Read to array
		const existingRecords = readFile(params.resultFilePath, true);
		// Remove file to avoid loop (Or if later open other route just to tell clean files of specified id)
		clearFiles([params.resultFilePath]);
		// Send allready done part back to importer
		throw new ApiError(HttpStatus.CONFLICT, existingRecords);
	}

	throw new ApiError(HttpStatus.CONFLICT, []);
}

function checkProcess(processId) {
	return new Promise(res => {
		exec(`ps --pid ${processId}`, {}, (error, stdout) => {
			if (stdout.indexOf(processId) === -1) {
				res(false);
			}

			res(true);
		});
	});
}
