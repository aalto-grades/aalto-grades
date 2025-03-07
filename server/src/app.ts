// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import cors from 'cors';
import express, {type Request} from 'express';
import helmet from 'helmet';

import {HttpCode} from '@/common/types';
import {FRONTEND_ORIGIN} from './configs/environment';
import {errorHandler} from './middleware/errorHandler';
import {requestLogger} from './middleware/requestLogger';
import {router} from './routes/index';
import {ApiError} from './types';

export const app = express();

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
      'https://ossi.cs.aalto.fi/api-docs/ for a list of available endpoints.',
    HttpCode.NotFound
  );
});

app.use(errorHandler);
