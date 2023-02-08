// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import cors from 'cors';
import express, { Application } from 'express';

import { router } from './routes/index';

export const app: Application = express();

app.use(cors({
  origin: 'http://localhost:3005',
  credentials: true,
}));

app.use('/', router);
