// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Application } from 'express';
import { router } from './routes/index';
import cors from 'cors';

export const app: Application = express();

app.use(cors({
  origin: 'http://localhost:3005'
}));

app.use('/', router);
