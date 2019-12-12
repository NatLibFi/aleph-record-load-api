/* eslint-disable no-unused-vars */

import fs from 'fs';
import path from 'path';

import {Utils} from '@natlibfi/melinda-commons';
import {logError} from '../utils';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function writeToFile(location, content, createFolders = false) {
	const fileLoc = path.resolve(location);
	logger.log('info', `writeToFile: fileLoc ${fileLoc}, content ${content}`);

	try {
		if (createFolders) {
			const folders = fileLoc.substring(0, fileLoc.lastIndexOf('/'));
			fs.mkdirSync(folders, {recursive: true}); // Permissions 755
			logger.log('debug', 'writeToFile: Folders created');
		}

		fs.writeFileSync(fileLoc, content);
		logger.log('debug', 'writeToFile: Write success');
	} catch (err) {
		logger.log('debug', 'writeToFile: Write error');
		logError(err);
	}
}

export function deleteFile(location) {
	const fileLoc = path.resolve(location);
	logger.log('info', `deleteFile: fileLoc ${fileLoc}`);

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
	logger.log('info', `checkIfExists: fileLoc ${fileLoc}`);

	try {
		fs.accessSync(fileLoc, fs.constants.F_OK);

		logger.log('debug', 'checkIfExists: File found');
		return true;
	} catch (err) {
		logger.log('debug', 'checkIfExists: File not found');
		return false;
	}
}
