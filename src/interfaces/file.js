import fs from 'fs';
import path from 'path';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {logError} from '@natlibfi/melinda-rest-api-commons';

const logger = createLogger();

export function writeToFile(location, content, createFolders = false, append = false) {
  const fileLoc = path.resolve(location);
  logger.log('debug', `writeToFile: fileLoc ${fileLoc}`);
  logger.log('silly', `writeToFile: content ${content}`);
  try {
    if (createFolders) {
      const folders = fileLoc.substring(0, fileLoc.lastIndexOf('/'));
      fs.mkdirSync(folders, {recursive: true});
      logger.log('debug', 'writeToFile: Folders created');

      return write();
    }

    return write();
  } catch (err) {
    logger.log('error', 'writeToFile: Write error');
    logError(err);
  }

  function write() {
    if (append) {
      fs.writeFileSync(fileLoc, content, {flag: 'as'});
      logger.log('debug', 'writeToFile: Write success');

      return;
    }

    fs.writeFileSync(fileLoc, content);
    logger.log('debug', 'writeToFile: Write success');
  }
}

export function getWriteStream(location) {
  return fs.createWriteStream(location, {flags: 'a'});
}

export function deleteFile(location) {
  const fileLoc = path.resolve(location);
  logger.log('debug', `deleteFile: fileLoc ${fileLoc}`);

  try {
    fs.unlinkSync(fileLoc);
    logger.log('debug', 'deleteFile: File deleted!');
  } catch (err) {
    logger.log('error', 'deleteFile: Error while tryed delete file!');
    logError(err);
  }
}

export function checkIfExists(location) {
  const fileLoc = path.resolve(location);
  logger.log('debug', `checkIfExists: fileLoc ${fileLoc}`);

  try {
    fs.accessSync(fileLoc, fs.constants.F_OK);

    logger.log('debug', 'checkIfExists: File found');
    return true;
  } catch (err) {
    logger.log('error', 'checkIfExists: File not found');
    logError(err);
    return false;
  }
}

export function readFile(location, listStyle = false) {
  const fileLoc = path.resolve(location);
  logger.log('debug', `readFile: fileLoc ${fileLoc}`);

  try {
    const content = fs.readFileSync(fileLoc);

    logger.log('debug', 'readFile: File readed');
    if (listStyle) {
      const list = content.toString().split(/\r?\n/gu);
      const filteredList = list.filter(content => content.length > 0);
      return filteredList;
    }

    return content.toString();
  } catch (err) {
    logger.log('error', 'readFile: Error while reading file');
    logError(err);
    return false;
  }
}

export function clearFiles(fileLocList) {
  fileLocList.forEach(fileLoc => {
    deleteFile(fileLoc);
  });
}
