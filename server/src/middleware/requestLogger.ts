// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {Request, RequestHandler} from 'express';
import morgan from 'morgan';

import {
  ChangeOwnAuthDataSchema,
  LoginDataSchema,
  ResetOwnPasswordDataSchema,
} from '@/common/types';
import httpLogger from '../configs/winston';

morgan.token('remote-addr', (req) => {
  return (req.headers['x-real-ip']
    || req.headers['x-forwarded-for']
    || req.socket.remoteAddress) as string;
});
morgan.token('user', (req: Request) => JSON.stringify(req.user));
morgan.token('params', (req: Request) => JSON.stringify(req.params));
morgan.token('body', (req: Request) => {
  // Check for request bodies which contain plaintext passwords
  const login = LoginDataSchema.safeParse(req.body);
  if (login.success) {
    return JSON.stringify({...login.data, password: 'omitted'});
  }

  const resetOwnPassword = ResetOwnPasswordDataSchema.safeParse(req.body);
  if (resetOwnPassword.success) {
    return JSON.stringify({
      ...resetOwnPassword.data,
      password: 'omitted',
      newPassword: 'omitted',
    });
  }

  const changeOwnAuth = ChangeOwnAuthDataSchema.safeParse(req.body);
  if (changeOwnAuth.success) {
    return JSON.stringify({...changeOwnAuth.data, newPassword: 'omitted'});
  }

  return JSON.stringify(req.body);
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
export const requestLogger: RequestHandler = morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version"'
  + ' :status :res[content-length] ":referrer" ":user-agent" ":user" ":params" ":body"',
  {
    stream: {
      write: (message: string) => httpLogger.http(message.trim()),
    },
  }
);
