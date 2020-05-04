import HttpStatus from 'http-status';
import {Utils} from '@natlibfi/melinda-commons';

export function createAuthMiddleware(API_KEYS) {
  const {createLogger} = Utils;
  const logger = createLogger();

  return (req, res, next) => {
    logger.log('verbose', 'Authenticating request');

    if (req.headers.authorization) {
      const b64auth = req.headers.authorization.split(' ')[1] || '';
      // Api-key is in the username slot password slot is ignored
      const [key] = Buffer.from(b64auth, 'base64').toString()
        .split(':');

      if (API_KEYS.includes(key)) {
        return next();
      }

      res.status(HttpStatus.FORBIDDEN).send(HttpStatus['403_MESSAGE']);
      return;
    }

    res.status(HttpStatus.UNAUTHORIZED).send(HttpStatus['401_MESSAGE']);
  };
}
