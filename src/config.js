/* eslint-disable no-unused-vars */
import {Utils} from '@natlibfi/melinda-commons/';

const {readEnvironmentVariable, parseBoolean} = Utils;

// Files
export const LOAD_COMMAND = readEnvironmentVariable('RECORD_LOAD_API_LOAD_COMMAND');
export const LOAD_COMMAND_ENV = readEnvironmentVariable('RECORD_LOAD_API_LOAD_COMMAND_ENV');
export const TEMP_FILE_PATH = readEnvironmentVariable('RECORD_LOAD_API_TEMP_FILE_PATH');
export const RESULT_FILE_PATH = readEnvironmentVariable('RECORD_LOAD_API_RESULT_FILE_PATH');

// Connection
export const API_KEYS = readEnvironmentVariable('RECORD_LOAD_API_KEYS');
export const HTTP_PORT = readEnvironmentVariable('RECORD_LOAD_API_HTTP_PORT', {defaultValue: 8090, format: v => Number(v)});
export const [OFFLINE_BEGIN, OFFLINE_DURATION] = readEnvironmentVariable('RECORD_LOAD_API_OFFLINE_PERIOD', {defaultValue: '0,0', format: v => v.split(',')});
