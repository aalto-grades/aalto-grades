// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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

const httpFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/http-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  level: 'http',
  zippedArchive: true,
  handleExceptions: true,
  maxSize: '5m',
  maxFiles: '3d',
});
const dbFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/database-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  level: 'verbose',
  zippedArchive: true,
  handleExceptions: true,
  maxSize: '5m',
  maxFiles: '3d',
});

httpFileTransport.on('error', error => {
  // TODO: Handle error
  throw error;
});
dbFileTransport.on('error', error => {
  // TODO: Handle error
  throw error;
});

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
    http: 3, // HTTP logs
    debug: 4,
  },
  format,
  transports: [new winston.transports.Console(), httpFileTransport],
});

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
  transports: [new winston.transports.Console(), dbFileTransport],
});

export default httpLogger;
