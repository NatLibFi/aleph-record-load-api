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

// NOTE:
/*
The default file names for the output file for rejected records and for the output file for logging system numbers have beenchanged.
Previously, the file names were p_manage_18.rej (for the rejected record file) and p_manage_18.log (for thelogging system numbers file).
Now, if the names of the files are not defined by the user,
the the file name is the same asthe name of the input file with the extension .rej and .doc_log
http://www.library.mcgill.ca/ALEPH/version16/ALEPH_Release%20Notes-15_2.pdf
*/

// Set params
export function setParams(query) {
	const id = (query.correlationId === 'undefined') ? uuid().replace(/-/g, '') : query.correlationId.replace(/-/g, '');
	const inputFile = format(TEMP_FILE_PATH, query.library.toLowerCase(), 'record-load-api/' + id + '.seq');
	const rejectedFile = 'record-load-api/' + id + '.rej';
	const resultFile = 'record-load-api/' + id + '.log';
	const rejectedFilePath = format(TEMP_FILE_PATH, query.library.toLowerCase(), rejectedFile);
	const resultFilePath = format(RESULT_FILE_PATH, resultFile);
	const allResultFile = (query.resultFile === undefined) ? null : query.resultFile;
	const allRejectedFile = (query.rejectedFile === undefined) ? null : query.rejectedFile;

	const params = {
		library: query.library,
		method: query.method,
		cataloger: query.cataloger,
		inputFile,
		rejectedFile,
		rejectedFilePath,
		allRejectedFile,
		resultFile,
		resultFilePath,
		allResultFile,
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
