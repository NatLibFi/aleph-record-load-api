import {Utils} from '@natlibfi/melinda-commons';
import {ALEPH_VERSION, MANDATORY_PARAMETERS, TEMP_FILE_PATH, LOG_FILE_PATH} from './config';
import util from 'util';
import uuid from 'uuid';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function logError(err) {
	if (err !== 'SIGINT') {
		logger.log('error', 'stack' in err ? err.stack : err);
	}

	logger.log('error', err);
}

// SET default params
export function setAndCheckDefaultParams(opts) {
	// Parsing parameters
	const pairs = opts.split('&');
	let temp = {};
	pairs.forEach(pair => {
		let [key, value] = pair.split('=');
		temp[key] = value;
	});

	// Temporary unique file ID
	let id;
	if (temp.QUEUEID) { // Backwards compatibility
		id = temp.QUEUEID.replace(/-/g, '');
	} else {
		id = uuid.v4();
		id = id.replace(/-/g, '');
	}

	// Constructing params Json
	const inputFile = util.format(TEMP_FILE_PATH, ALEPH_VERSION, temp.library, id, '.seq');
	const rejectedFile = util.format(TEMP_FILE_PATH, ALEPH_VERSION, temp.library, id, '.rej');
	const logFile = util.format(LOG_FILE_PATH, ALEPH_VERSION, id + '.log');
	const params = {
		library: temp.library,
		method: temp.method,
		cataloger: temp.cataloger,
		inputFile,
		rejectedFile,
		logFile,
		fixRoutine: temp.fixRoutine || '',
		indexing: temp.indexing || 'FULL',
		updateAction: temp.updateAction || 'APP',
		mode: temp.mode || 'M',
		charConversion: temp.charConversion || '',
		mergeRoutine: temp.mergeRoutine || '',
		catalogerLevel: temp.catalogerLevel || '',
		indexingPriority: temp.indexingPriority || ''
	};

	// Validate that all needed variables are there
	let valid = true;
	MANDATORY_PARAMETERS.forEach(param => {
		if (params[param] === undefined) {
			valid = false;
			console.log(param);
		}
	});

	if (valid) {
		return params;
	}

	return false;
}

export function validateID(id) {
	logger.log('info', `Validating id ${id}!`);
	if (/^\d{9}$/.test(id.trim())) {
		return id;
	}

	return false;
}
