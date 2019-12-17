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
	if (opts.startsWith('?')) {
		opts = opts.substr(1);
	}

	const pairs = opts.split('&');
	let temp = {};
	pairs.forEach(pair => {
		let [key, value] = pair.split('=');
		temp[key] = value;
	});

	// Constructing params Json
	const id = uuid.v4().replace(/-/g, '');
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
		indexingPriority: temp.indexingPriority || '',
		QUEUEID: temp.QUEUEID || ''
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
