import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status';
import {createLogger, createExpressLogger} from '@natlibfi/melinda-backend-commons';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {createAuthMiddleware} from './interfaces/middleware';
import {createRequestHandler} from './routes';
import {logError} from '@natlibfi/melinda-rest-api-commons';


export default async function ({HTTP_PORT, API_KEYS, LOAD_COMMAND, LOAD_COMMAND_ENV, TEMP_FILE_PATH, RESULT_FILE_PATH}) {
  const logger = createLogger();
  const app = await initExpress();
  return app.listen(HTTP_PORT, () => logger.log('info', `Record-load-api: listenning port ${HTTP_PORT}`));

  async function initExpress() {
    const app = express();

    app.use(createExpressLogger());
    app.use(createAuthMiddleware(API_KEYS));
    app.use(bodyParser.text({limit: '5MB', type: '*/*'}));
    app.use(await createRequestHandler({LOAD_COMMAND, LOAD_COMMAND_ENV, TEMP_FILE_PATH, RESULT_FILE_PATH}));

    app.use(handleError);

    return app;
  }

  function handleError(err, req, res) {
    logError(err);
    if (err instanceof ApiError) {
      return res.status(err.status).json(err.payload);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
