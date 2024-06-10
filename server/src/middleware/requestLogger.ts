// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {RequestHandler} from 'express';
import morgan from 'morgan';

import logger, {syslogger} from '../configs/winston';
import {JwtClaims} from '../types';

morgan.token('remote-addr', req => {
  return (req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress) as string;
});

/**
 * Log messages for incoming HTTP requests to the Express server. Morgan formats
 * the requests using a custom string format, and then logs them using winston
 * logger. https://expressjs.com/en/resources/middleware/morgan.html Winston
 * logs the data to files (depends on the NODE_ENV, see winston setup in
 * ./configs).
 *
 * Includes following details: remote IP, user, request method, the URL
 * accessed, HTTP version, response status, content length, referrer, and
 * user-agent.
 *
 * This implementation pipes the logs from morgan into the winston logger,
 * allowing for uniformity in log handling, and enabling any additional
 * configurations (like file logging) made in winston.
 */
export const requestLogger: RequestHandler = morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version"' +
    ' :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }
);

export const requestSyslogger: RequestHandler = morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version"' +
    ' :status  :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message: string) => syslogger.info(message.trim()),
    },
  }
);

/**
 * Log auth info with more details about request. Use after
 * passport.authenticate and express.json but before authorization and
 * processRequestBody
 */
export const authLogger: RequestHandler = (req, res, next) => {
  const params = JSON.stringify(req.params);
  const query = JSON.stringify(req.query);
  const body = JSON.stringify(req.body ?? {});
  const user = req.user as JwtClaims;
  logger.info(
    `${user.id} ${user.role} ${req.method} ${req.url} ${params} ${query} ${body}`
  );
  next();
};
