/* eslint-disable no-unused-vars */

import {validateID} from '../utils';
import {LOCKFILE_PATH, LOAD_COMMAND, ALEPH_VERSION} from '../config';
import {writeToFile, checkIfExists, deleteFile} from './fileService';
import {execSync} from 'child_process';
import HttpStatus from 'http-status';
import util from 'util';

import {Utils} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function createRecord(payload, params) {
	logger.log('info', 'createService: createRecord');
	// TODO: Write logs
	// TODO: error file

	try {
		// Check if OLD OR NEW
		let id;
		if (params.mode === 'OLD') {
			id = validateID(payload.slice(0, 9));
		} else {
			id = '0';
		}

		if (!id) {
			return {status: HttpStatus.UNPROCESSABLE_ENTITY, message: httpStatus['422_MESSAGE'], id};
		}

		// Check lockfile
		const fullLockPath = util.format(LOCKFILE_PATH, ALEPH_VERSION, id);
		if (!checkIfExists(fullLockPath)) {
			// Create lockfile
			writeToFile(fullLockPath, id, true);

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
                . /exlibris/aleph/a${ALEPH_VERSION}/alephm/.cshrc
                ${LOAD_COMMAND} ${values}
                exit`;
			const exTemp = 'echo \'createService -> BASH -> CHANGE THIS TO exLoadCommand!\'';

			execSync(exTemp, {stdio: 'inherit'});

			// Remove lockfile
			deleteFile(fullLockPath);
			if (params.QUEUEID) {
				// Send QUEUEID back to notify prio job client
			}

			return {status: HttpStatus.OK, message: httpStatus['200_MESSAGE'], id};
		}

		return {status: HttpStatus.CONFLICT, message: httpStatus['409_MESSAGE']};
	} catch (err) {
		return {status: HttpStatus.INTERNAL_SERVER_ERROR, message: httpStatus['500_MESSAGE']};
	}
}

