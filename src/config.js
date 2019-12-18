/* eslint-disable no-unused-vars */
import {Utils} from '@natlibfi/melinda-commons/';

const {readEnvironmentVariable, parseBoolean} = Utils;

// Files
export const LOAD_COMMAND = readEnvironmentVariable('LOAD_COMMAND');
export const LOAD_COMMAND_ENV = readEnvironmentVariable('LOAD_COMMAND_ENV');
export const TEMP_FILE_PATH = readEnvironmentVariable('TEMP_FILE_PATH');
export const RESULT_FILE_PATH = readEnvironmentVariable('RESULT_FILE_PATH');

// Connection
export const API_KEYS = readEnvironmentVariable('API_KEYS');
export const HTTP_PORT = readEnvironmentVariable('HTTP_PORT', {defaultValue: 8080, format: v => Number(v)});
export const OFFLINE_PERIOD = readEnvironmentVariable('OFFLINE_PERIOD', {defaultValue: '0,0'});

// General
export const MANDATORY_PARAMETERS = [
	'library',
	'method',
	'cataloger',
	'inputFile',
	'rejectedFile',
	'resultFile',
	'fixRoutine',
	'indexing',
	'updateAction',
	'mode',
	'charConversion',
	'mergeRoutine',
	'catalogerLevel',
	'indexingPriority'
];
