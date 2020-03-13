import {Error as ApiError, Utils} from '@natlibfi/melinda-commons';
import {readFile, clearFiles, checkIfExists, writeToFile} from './file';
import {exec} from 'child_process';
import HttpStatus from 'http-status';

export async function checkProcessStatus({processId, processLogFilePath, rejectedFilePath, resultFilePath, allRejectedFile, allResultFile}) {
  const {createLogger} = Utils;
  const logger = createLogger(); // eslint-disable-line no-unused-vars

  logger.log('debug', 'Checking prosess status');
  // SPAMS logger.log(JSON.stringify(params));

  // Check if process exists
  if (await checkProcess(processId)) {
    return {status: HttpStatus.LOCKED};
  }

  // Read to array
  if (!checkIfExists(processLogFilePath)) {
    return {status: HttpStatus.NOT_FOUND};
  }

  const processLog = readFile(processLogFilePath, true);
  const lastLine = processLog[processLog.length - 1];
  logger.log('debug', `Last line of process log: ${lastLine}`);

  if (lastLine.startsWith('end')) {
    logger.log('info', 'LOAD_COMMAND succesfull');
    logger.log('info', 'Checking LOAD_COMMAND results');

    // Logs if something is found in rejected file and saves it to file if log file is given
    const rejected = readFile(rejectedFilePath, false);
    handleRejected(rejected);
    // Get id/s from result file (000000001FIN01\n000000002FIN01\n000000003FIN01...)
    // As list (["000000001FIN01","000000002FIN01","000000003FIN01"...]) and save it if bulk request
    // Return status and ids
    return handleIds(readFile(resultFilePath, true));
  }

  // Check if result file exists (e.g. crash has happened)
  if (checkIfExists(resultFilePath)) { // eslint-disable-line functional/no-conditional-statement
    // Read to array
    const existingRecords = readFile(resultFilePath, true);
    // Remove file to avoid loop (Or if later open other route just to tell clean files of specified id)
    clearFiles([resultFilePath]);
    // Send allready done part back to importer
    throw new ApiError(HttpStatus.CONFLICT, existingRecords);
  }

  throw new ApiError(HttpStatus.CONFLICT, []);

  function checkProcess(processId) {
    return new Promise(resolve => {
      exec(`ps --pid ${processId}`, {}, (error, stdout) => {
        if (stdout.indexOf(processId) === -1) {
          logger.log('debug', 'Process not found');
          return resolve(false);
        }

        logger.log('debug', 'Process found');
        resolve(true);
      });
    });
  }

  function handleRejected(rejected) {
    logger.log('debug', 'Handle rejected!');
    if (rejected.length > 0) {
      logger.log('error', 'There is something in rejected');
      logger.log('error', rejected);

      if (allRejectedFile !== null) {
        logger.log('debug', 'Writing all error log');
        return writeToFile(allRejectedFile, `${rejected}\n`, true, true);
      }
    }
  }

  function handleIds(ids) {
    logger.log('debug', 'Handle ids!');
    if (ids) {
      if (allResultFile !== null) {
        logger.log('debug', 'Writing all log');
        writeToFile(allResultFile, `${ids.join('\n')}\n`, true, true);

        return {status: HttpStatus.OK, payload: ids};
      }

      return {status: HttpStatus.OK, payload: ids};
    }

    throw new ApiError(HttpStatus.NOT_ACCEPTABLE, 'Send material produced 0 valid records');
  }
}
