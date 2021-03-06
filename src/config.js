import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';

// Files
export const LOAD_COMMAND = readEnvironmentVariable('RECORD_LOAD_API_LOAD_COMMAND');
export const LOAD_COMMAND_ENV = readEnvironmentVariable('RECORD_LOAD_API_LOAD_COMMAND_ENV');
export const TEMP_FILE_PATH = readEnvironmentVariable('RECORD_LOAD_API_TEMP_FILE_PATH');
export const RESULT_FILE_PATH = readEnvironmentVariable('RECORD_LOAD_API_RESULT_FILE_PATH');

// Connection
export const API_KEYS = readEnvironmentVariable('RECORD_LOAD_API_KEYS', {format: v => v.split(',')});
export const HTTP_PORT = readEnvironmentVariable('RECORD_LOAD_API_HTTP_PORT', {defaultValue: 8090, format: v => Number(v)});
