import fs from 'fs';
import path from 'path';

import {Utils} from '@natlibfi/melinda-commons';
import {logError} from '../utils';
const {createLogger} = Utils;
const logger = createLogger(); // eslint-disable-line no-unused-vars

export function writeToFile(location, content, createFolders = false) {
	const fileLoc = path.resolve(location);
	logger.log('debug', `writeToFile: fileLoc ${fileLoc}`);
	// Spams logger.log('debug', `writeToFile: content ${content}`);
	try {
		if (createFolders) {
			const folders = fileLoc.substring(0, fileLoc.lastIndexOf('/'));
			fs.mkdirSync(folders, {recursive: true}); // Permissions 755 needed?
			logger.log('debug', 'writeToFile: Folders created');
		}

		fs.writeFileSync(fileLoc, content);
		logger.log('debug', 'writeToFile: Write success');
	} catch (err) {
		logger.log('error', 'writeToFile: Write error');
		logError(err);
	}
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
			return content.toString().split(/\r?\n/g);
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
