// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import winston from 'winston';

import {NODE_ENV} from './environment';

const colors: winston.config.AbstractConfigSetColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
};

winston.addColors(colors);

const baseFormat = winston.format.combine(
  winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
  winston.format.printf(
    (http: winston.Logform.TransformableInfo) =>
      `${http.timestamp} ${http.level}: ${http.message}`
  )
);
const format =
  NODE_ENV === 'production'
    ? baseFormat
    : winston.format.combine(
        winston.format.colorize({all: true}), // Just setting this to false doesn't remove the colors
        baseFormat
      );

/**
 * Set up a Winston logger to log all output to the console. More information
 * about logger transports (for streaming logs automatically to a database, log
 * managers, etc.):
 * https://github.com/winstonjs/winston/blob/master/docs/transports.md
 *
 * Currently both loggers log to the cli identically but some separation might
 * be added later
 */

/** Logger for http logs */
const httpLogger: winston.Logger = winston.createLogger({
  level:
    NODE_ENV === 'production'
      ? 'http'
      : NODE_ENV === 'test'
        ? 'error'
        : 'debug',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3, // HTTP logs
    debug: 4,
  },
  format,
  transports: [new winston.transports.Console()],
});

/** Logger for db logs */
export const dbLogger: winston.Logger = winston.createLogger({
  level:
    NODE_ENV === 'production'
      ? 'verbose'
      : NODE_ENV === 'test'
        ? 'error'
        : 'debug',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3, // DB logs
    debug: 4,
  },
  format,
  transports: [new winston.transports.Console()],
});

export default httpLogger;
