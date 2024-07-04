// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, RequestHandler} from 'express';
import morgan from 'morgan';

import httpLogger from '../configs/winston';

morgan.token('remote-addr', req => {
  return (req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress) as string;
});

/**
 * Log messages for incoming HTTP requests to the Express server. Morgan formats
 * the requests using a custom string format, and then logs them using winston
 * logger. https://expressjs.com/en/resources/middleware/morgan.html.
 *
 * Includes following details: remote IP, user, request method, the URL
 * accessed, HTTP version, response status, content length, referrer,
 * user-agent, jwt token data, request params and request body.
 *
 * This implementation pipes the logs from morgan into the winston logger,
 * allowing for uniformity in log handling, and enabling any additional
 * configurations (like file logging) made in winston.
 */

morgan.token('user', (req: Request) => JSON.stringify(req.user));
morgan.token('params', (req: Request) => JSON.stringify(req.params));
morgan.token('body', (req: Request) => JSON.stringify(req.body));

export const requestLogger: RequestHandler = morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version"' +
    ' :status :res[content-length] ":referrer" ":user-agent" ":user" ":params" ":body"',
  {
    stream: {
      write: (message: string) => httpLogger.http(message.trim()),
    },
  }
);
