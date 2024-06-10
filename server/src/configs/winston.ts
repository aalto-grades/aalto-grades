// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import winston from 'winston';

import {NODE_ENV} from './environment';

const colors: winston.config.AbstractConfigSetColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Set up a Winston logger to log all output to the console and errors to
 * separate log files in the ./logs directory. More information about logger
 * transports (for streaming logs automatically to a database, log managers,
 * etc.): https://github.com/winstonjs/winston/blob/master/docs/transports.md
 */
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
    http: 3,
    debug: 4,
  },
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
    winston.format.colorize({all: NODE_ENV !== 'production'}), // Remove (some) colors in prod?
    winston.format.printf(
      (http: winston.Logform.TransformableInfo) =>
        `${http.timestamp} ${http.level}: ${http.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export const dbLogger: winston.Logger = winston.createLogger({
  level:
    NODE_ENV === 'production'
      ? 'info'
      : NODE_ENV === 'test'
        ? 'error'
        : 'debug',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
    winston.format.printf(
      (http: winston.Logform.TransformableInfo) =>
        `${http.timestamp} ${http.level}: ${http.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/database.log',
      level: 'info',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export default httpLogger;
