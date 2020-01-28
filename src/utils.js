import {Utils} from '@natlibfi/melinda-commons';
import {MANDATORY_PARAMETERS, TEMP_FILE_PATH, RESULT_FILE_PATH} from './config';
import util from 'util';
import uuid from 'uuid';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function logError(err) {
	if (err === 'SIGINT') {
		logger.log('error', err);
	} else {
		logger.log('error', 'stack' in err ? err.stack : err);
	}
}

// Set default params
export function setAndCheckDefaultParams(query) {
	// Constructing params Json
	const id = uuid.v4().replace(/-/g, ''); // TODO pass correlationId here?
	const inputFile = util.format(TEMP_FILE_PATH, query.library, 'record-load-api/' + id + '.seq');
	const rejectedFile = 'record-load-api/' + id + '.rej';
	const resultFile = 'record-load-api/' + id + '.log';
	const rejectedFilePath = util.format(TEMP_FILE_PATH, query.library, rejectedFile);
	const resultFilePath = util.format(RESULT_FILE_PATH, resultFile);
	// TODO: Ask from Henri do they use any of theis... if they do they need to be exposed in rest-api
	const params = {
		library: query.library,
		method: query.method,
		cataloger: query.cataloger,
		inputFile,
		rejectedFile,
		rejectedFilePath,
		resultFile,
		resultFilePath,
		fixRoutine: query.fixRoutine || '',
		indexing: query.indexing || 'FULL',
		updateAction: query.updateAction || 'APP',
		mode: query.mode || 'M',
		charConversion: query.charConversion || '',
		mergeRoutine: query.mergeRoutine || '',
		catalogerLevel: query.catalogerLevel || '',
		indexingPriority: query.indexingPriority || ''
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
