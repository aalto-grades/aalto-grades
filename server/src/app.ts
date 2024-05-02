// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import cors from 'cors';
import express, {Application, Request} from 'express';
import helmet from 'helmet';

import {HttpCode} from '@/common/types';
import {FRONTEND_ORIGIN, NODE_ENV} from './configs/environment';
import {errorHandler} from './middleware/errorHandler';
import {requestLogger, requestSyslogger} from './middleware/requestLogger';
import {router} from './routes/index';
import {ApiError} from './types';

export const app: Application = express();

if (NODE_ENV !== 'production') {
  // Dont use colorful logs for production syslog logging
  app.use(requestLogger);
}

if (NODE_ENV !== 'test') {
  // tests timeout for some reason if used

  // app.use(express.json()); Commented out because maybe not needed?
  // If enabled use {limit: '25mb'} to allow uploading a big list of grades

  app.use(requestSyslogger);
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(helmet());

app.use('/', router);

// Handle unmatched routes and throw an API error.
app.use((req: Request): void => {
  throw new ApiError(
    `Cannot ${req.method} ${req.path}. Please refer to the API documentation at ` +
      'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.',
    HttpCode.NotFound
  );
});

app.use(errorHandler);
