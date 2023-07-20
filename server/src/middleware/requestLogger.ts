// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { RequestHandler } from 'express';
import morgan from 'morgan';

import logger from '../configs/winston';

/**
 * Morgan formats incoming request to logger friendly format.
 * Winston logs the data to files (depends on the NODE_ENV,
 * see winston setup in ./configs).
 * https://expressjs.com/en/resources/middleware/morgan.html
 */
export const requestLogger: RequestHandler = morgan(
  ':remote-addr :remote-user ":method :url HTTP/:http-version"' +
  ' :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message: string) => logger.http(message.trim())
    }
  }
);
