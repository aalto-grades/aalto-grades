// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import cors from 'cors';
import express, {Application, Request} from 'express';
import helmet from 'helmet';

import {FRONTEND_ORIGIN} from './configs/environment';

import {errorHandler} from './middleware/errorHandler';
import {requestLogger} from './middleware/requestLogger';
import {router} from './routes/index';
import {ApiError} from './types';

// Register formulas before starting Express.
require('./formulas');

export const app: Application = express();

app.use(requestLogger);

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
