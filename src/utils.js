import {Utils} from '@natlibfi/melinda-commons';
import {TEMP_FILE_PATH, RESULT_FILE_PATH} from './config';
import {format} from 'util';
import {v4 as uuid} from 'uuid';

const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function logError(err) {
	if (err === 'SIGINT') {
		logger.log('error', err);
	} else {
		logger.log('error', 'stack' in err ? err.stack : err);
	}
}

// Set params
export function setParams(query) {
	const id = uuid().replace(/-/g, '');
	const inputFile = format(TEMP_FILE_PATH, query.library, 'record-load-api/' + id + '.seq');
	const rejectedFile = 'record-load-api/' + id + '.rej';
	const resultFile = 'record-load-api/' + id + '.log';
	const rejectedFilePath = format(TEMP_FILE_PATH, query.library, rejectedFile);
	const resultFilePath = format(RESULT_FILE_PATH, resultFile);

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

	return params;
}
