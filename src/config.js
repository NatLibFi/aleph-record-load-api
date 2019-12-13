/* eslint-disable no-unused-vars */
import {Utils} from '@natlibfi/melinda-commons/';

const {readEnvironmentVariable, parseBoolean} = Utils;

// General
export const ALEPH_VERSION = readEnvironmentVariable('ALEPH_VERSION', {defaultValue: '23_3'});
export const LOAD_COMMAND = readEnvironmentVariable('LOAD_COMMAND', {defaultValue: '/LOAD-COMMAND-PATH-HERE/'});
export const LOAD_COMMAND_ENV = readEnvironmentVariable('LOAD_COMMAND_ENV', {defaultValue: 'LOAD-COMMAND-ENV-PATH-HERE'});
export const OFFLINE_PERIOD = readEnvironmentVariable('OFFLINE_PERIOD', {defaultValue: '{"start": 0, "duration": 0}'});

// Files
export const TEMP_FILE_PATH = readEnvironmentVariable('TEMP_FILE_PATH', {defaultValue: '/INPUT-FILE-PATH-HERE/'});
export const LOG_FILE_PATH = readEnvironmentVariable('LOG_FILE_PATH', {defaultValue: '/LOG_FILE_PATH-HERE/'});

// Connection
export const HTTP_PORT = readEnvironmentVariable('HTTP_PORT', {defaultValue: '3000'});
export const IP_FILTER = readEnvironmentVariable('IP_FILTER', {defaultValue: '[".*"]'});
export const API_KEYS = readEnvironmentVariable('API_KEYS', {defaultValue: ''});

export const MANDATORY_PARAMETERS = [
	'library',
	'method',
	'cataloger',
	'inputFile',
	'rejectedFile',
	'logFile',
	'fixRoutine',
	'indexing',
	'updateAction',
	'mode',
	'charConversion',
	'mergeRoutine',
	'catalogerLevel',
	'indexingPriority'
];
