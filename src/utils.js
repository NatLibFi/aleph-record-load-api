import {format} from 'util';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {v4 as uuid} from 'uuid';

const logger = createLogger();
// NOTE:
/*
The default file names for the output file for rejected records and for the output file for logging system numbers have beenchanged.
Previously, the file names were p_manage_18.rej (for the rejected record file) and p_manage_18.log (for thelogging system numbers file).
Now, if the names of the files are not defined by the user,
the the file name is the same asthe name of the input file with the extension .rej and .doc_log
http://www.library.mcgill.ca/ALEPH/version16/ALEPH_Release%20Notes-15_2.pdf
*/

// Set params
export function setExecutionParams({query, TEMP_FILE_PATH, RESULT_FILE_PATH}) {
  const fileParams = makeFileParams({query, TEMP_FILE_PATH, RESULT_FILE_PATH});

  const params = {
    ...fileParams,
    pActiveLibrary: query.pActiveLibrary.toUpperCase(),
    pOldNew: query.pOldNew,
    pFixType: query.pFixType || 'API',
    pUpdateF: query.pUpdateF || 'FULL',
    pUpdateType: query.pUpdateType || 'REP',
    pUpdateMode: query.pUpdateMode || 'M',
    pCharConv: query.pCharConv || '',
    pMergeType: query.pMergeType || '',
    pCatalogerIn: query.pCatalogerIn,
    pCatalogerLevelX: query.pCatalogerLevelX || '',
    pZ07PriorityYear: query.pZ07PriorityYear || ''
  };

  return params;
}

export function setCheckParams({query, TEMP_FILE_PATH, RESULT_FILE_PATH}) {
  const fileParams = makeFileParams({query, TEMP_FILE_PATH, RESULT_FILE_PATH});

  const params = {
    ...fileParams,
    pActiveLibrary: query.pActiveLibrary,
    processId: query.processId.length > 6 ? query.processId.slice(0, 6) : query.processId // "Sanitize" length of input (HUGE RISK IF NOT DONE!)
  };

  return params;
}

function makeFileParams({query, TEMP_FILE_PATH, RESULT_FILE_PATH}) {
  const correlationId = handleCorrelationId(query.correlationId);
  logger.log('debug', `Setting correlationId ${correlationId}`);
  const id = correlationId.replace(/-/gu, '');
  const inputFile = format(TEMP_FILE_PATH, query.pActiveLibrary.toLowerCase(), `record-load-api/${id}.seq`);
  const rejectedFile = `record-load-api/${id}.rej`;
  const rejectedFilePath = format(TEMP_FILE_PATH, query.pActiveLibrary.toLowerCase(), rejectedFile);
  const resultFile = `record-load-api/${id}.log`;
  const resultFilePath = format(RESULT_FILE_PATH, resultFile);
  const processLogFilePath = format(TEMP_FILE_PATH, query.pActiveLibrary.toLowerCase(), `record-load-api/${id}.processlog`);

  return {
    correlationId,
    inputFile,
    rejectedFile,
    rejectedFilePath,
    allRejectedFile: handleAllFileParam(query.pRejectFile),
    resultFile,
    resultFilePath,
    allResultFile: handleAllFileParam(query.pLogFile),
    processLogFilePath
  };

  function handleCorrelationId(queryCorrelationId) {
    if (queryCorrelationId && queryCorrelationId !== 'undefined') {
      return queryCorrelationId;
    }
    return uuid();
  }

  function handleAllFileParam(param) {
    if (param === undefined || param === 'null') {
      return null;
    }

    return param;
  }
}
