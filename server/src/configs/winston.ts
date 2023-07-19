import winston from 'winston';

import { NODE_ENV } from './environment';

const colors: winston.config.AbstractConfigSetColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Levels as in lowest logging level included on the logs.
 * E.g., 'info' logs info level and anything above ('warn' and 'error').
 */
const level: string = ((): string => {
  switch (NODE_ENV) {
  case 'production':
    return 'http';
  case 'test':
    return 'error';
  default:
    return 'debug';
  }
})();

/**
 * Winston setup logs logger output to console and
 * error logs in separate log files in ./logs directory.
 * More information about logger transports (for streaming
 * logs automatically to database, log managers, etc.):
 * https://github.com/winstonjs/winston/blob/master/docs/transports.md
 */
const logger: winston.Logger = winston.createLogger({
  level,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (http: winston.Logform.TransformableInfo) =>
        `${http.timestamp} ${http.level}: ${http.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

export default logger;
