import {Error, Utils} from '@natlibfi/melinda-commons';
import {readFile, clearFiles, checkIfExists, writeToFile} from './file';
import {exec} from 'child_process';
import HttpStatus from 'http-status';

export async function checkProcessStatus(params) {
	const {createLogger} = Utils;
	const logger = createLogger(); // eslint-disable-line no-unused-vars

	logger.log('debug', 'Checking prosess status');
	// SPAMS logger.log(JSON.stringify(params));

	const processId = params.processId;

	// Check if process exists
	const found = await checkProcess(processId);
	logger.log('debug', `Process found: ${found}`);

	if (found) {
		return {status: 423};
	}

	// Read to array
	if (!checkIfExists(params.processLogFilePath)) {
		return {status: 404};
	}

	const processLog = readFile(params.processLogFilePath, true);
	const lastLine = processLog[processLog.length - 1];
	logger.log('debug', 'Last line of process log: ' + lastLine);

	if (lastLine.startsWith('end')) {
		logger.log('info', 'LOAD_COMMAND succesfull');
		logger.log('info', 'Checking LOAD_COMMAND results');

		// Logs if something is found in rejected file and saves it to file if log file is given
		const rejected = readFile(params.rejectedFilePath, false);
		handleRejected(rejected);
		// Get id/s from result file (000000001FIN01\n000000002FIN01\n000000003FIN01...)
		// as list (["000000001FIN01","000000002FIN01","000000003FIN01"...]) and save it if bulk request
		const ids = readFile(params.resultFilePath, true);

		// Return status and ids
		return handleIds(ids);
	}

	// Check if result file exists (e.g. crash has happened)
	if (checkIfExists(params.resultFilePath)) {
		// Read to array
		const existingRecords = readFile(params.resultFilePath, true);
		// Remove file to avoid loop (Or if later open other route just to tell clean files of specified id)
		clearFiles([params.resultFilePath]);
		// Send allready done part back to importer
		throw new Error(HttpStatus.CONFLICT, existingRecords);
	}

	throw new Error(HttpStatus.CONFLICT, []);

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

	function handleRejected(rejected) {
		logger.log('debug', 'Handle rejected!');
		if (rejected.length > 0) {
			logger.log('error', 'There is something in rejected');
			logger.log('error', rejected);

			if (params.allRejectedFile !== null) {
				logger.log('debug', 'Writing all error log');
				writeToFile(params.allRejectedFile, rejected + '\n', true, true);
			}
		}
	}

	function handleIds(ids) {
		logger.log('debug', 'Handle ids!');
		if (ids) {
			if (params.allResultFile !== null) {
				logger.log('debug', 'Writing all log');
				writeToFile(params.allResultFile, ids.join('\n') + '\n', true, true);

				return {status: HttpStatus.OK, payload: ids};
			}

			return {status: HttpStatus.OK, payload: ids};
		}

		throw new Error(HttpStatus.NOT_ACCEPTABLE, 'Send material produced 0 valid records');
	}
}
