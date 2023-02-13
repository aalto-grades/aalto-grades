// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import cors from 'cors';
import express, { Application } from 'express';

import { FRONTEND_ORIGIN } from './configs/environment';

import { router } from './routes/index';
import { ErrorHandler } from './middleware/errorHandler';

export const app: Application = express();

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use('/', router);
app.use(ErrorHandler);
