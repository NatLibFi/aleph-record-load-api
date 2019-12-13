import {logError} from '../utils';
import {LOAD_COMMAND, ALEPH_VERSION, LOAD_COMMAND_ENV} from '../config';
import {writeToFile} from './fileService';
import {execSync} from 'child_process';
import HttpStatus from 'http-status';
import {Utils} from '@natlibfi/melinda-commons';

import httpStatus from 'http-status';
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
			params.logFile,
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
					. ${LOAD_COMMAND_ENV.replace(/%s/g, ALEPH_VERSION)}
					${LOAD_COMMAND.replace(/%s/g, ALEPH_VERSION)} ${values}
					exit`;
		execSync(exLoadCommand, {stdio: 'inherit'});
		// ExecSync(exLoadCommand, ['pipe', 'pipe', process.stderr]);

		// TODO: REMOVE after test
		const test = true;
		if (test) {
			// WriteToFile(params.rejectedFile, '', true);
			writeToFile(params.logFile, '0', true);
		}

		return {status: HttpStatus.OK, message: httpStatus['200_MESSAGE'], id: []};
	} catch (err) {
		logError(err);

		return {status: HttpStatus.INTERNAL_SERVER_ERROR, message: httpStatus['500_MESSAGE']};
	}
}

