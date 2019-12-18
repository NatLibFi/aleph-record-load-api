import {logError} from '../utils';
import {LOAD_COMMAND, LOAD_COMMAND_ENV} from '../config';
import {writeToFile} from './fileService';
import {execSync} from 'child_process';
import {Utils} from '@natlibfi/melinda-commons';
import {clearFiles, checkIfExists, readFile} from '../services/fileService';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createRecord(payload, params) {
	logger.log('info', 'createService: createRecord');

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

		// SHELL this uses sh or dash not sure... old was csh
		// Load basic env's usr/bin/env
		// Load custom env variables /exlibris/aleph/a{}/alephm/.cshrc
		// Run load_command with argument
		// Close shell
		// MORE INFO: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
		const exLoadCommand = `/usr/bin/env
					. ${LOAD_COMMAND_ENV}
					${LOAD_COMMAND} ${values}
					exit`;
		// To see execSync in action: execSync(exLoadCommand, {stdio: 'inherit'});
		execSync(exLoadCommand, ['pipe', 'pipe', process.stderr]); // Hides io streams from logs

		// TODO: REMOVE after test
		const test = true;
		if (test) {
			// WriteToFile(params.rejectedFile, '', true); // Simulates p_manage_18 failed execution
			writeToFile(params.resultFile, '0\n1\n2\n3\n4\n5', true); // Simulates p_manage_18 succesfully executed operation
		}

		if (checkIfExists(params.rejectedFile)) {
			// TODO Read & log errors from file to pass 'em to Lokit?
			clearFiles([params.inputFile, params.resultFile]); // Leave error file?
			return 400;
		}

		// Get new id/s from result file
		const ids = readFile(params.resultFile, true);
		if (ids) {
			clearFiles([params.inputFile, params.resultFile]);
			return ids;
		}
	} catch (err) {
		logError(err);
		clearFiles([params.inputFile, params.rejectedFile, params.resultFile]);
		return 500;
	}
}

