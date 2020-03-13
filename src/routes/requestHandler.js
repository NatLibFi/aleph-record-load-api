import {Router} from 'express';
import {Error as ApiError, Utils} from '@natlibfi/melinda-commons';
import {setExecutionParams, setCheckParams} from '../utils';
import loader from '../interfaces/loader';
import {checkProcessStatus} from '../interfaces/check';
import {clearFiles} from '../interfaces/file'; // eslint-disable-line no-unused-vars
import httpStatus from 'http-status';

const {createLogger} = Utils;

export default () => {
  const logger = createLogger(); // eslint-disable-line no-unused-vars
  const loaderOperator = loader();

  return new Router()
    .use(contentTypeMiddleware)
    .post('/', handleRequest)
    .get('/', checkProcess)
    .delete('/', requestClearFiles);

  async function handleRequest(req, res, next) {
    try {
      logger.log('info', 'router: handleRequest');

      logger.log('debug', `Query ${JSON.stringify(req.query)}`);
      const params = setExecutionParams(req.query);

      const result = loaderOperator.execute(req.body, params);
      await Promise.all([result]);

      // Lets keep correlation id with us! It helps to find process files!
      const response = {
        correlationId: params.correlationId,
        pLogFile: params.allResultFile,
        pRejectFile: params.allRejectedFile,
        ...result
      };

      logger.log('debug', `response: ${JSON.stringify(response)}`);

      res.status(httpStatus.OK).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async function checkProcess(req, res, next) {
    try {
      logger.log('info', 'router: checkProcess');

      logger.log('debug', `Query ${JSON.stringify(req.query)}`);
      const params = setCheckParams(req.query);

      const response = await checkProcessStatus(params);

      if (response.status === httpStatus.LOCKED) {
        return res.sendStatus(httpStatus.LOCKED);
      }

      logger.log('debug', `response: ${JSON.stringify(response)}`);

      res.status(response.status).json(response.payload);
    } catch (error) {
      return next(error);
    }
  }

  function requestClearFiles(req, res, next) {
    try {
      logger.log('info', 'router: checkProcess');

      logger.log('debug', `Query ${JSON.stringify(req.query)}`);
      const params = setCheckParams(req.query);

      // Cleaning
      clearFiles([
        params.inputFile,
        params.rejectedFilePath,
        params.resultFilePath,
        params.processLogFilePath
      ]);

      res.sendStatus(httpStatus.NO_CONTENT);
    } catch (error) {
      return next(error);
    }
  }

  function contentTypeMiddleware(req, res, next) {
    if (req.headers['content-type'] !== 'text/plain') { // eslint-disable-line functional/no-conditional-statement
      throw new ApiError(httpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    return next();
  }
};
