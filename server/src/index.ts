// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { port } from './configs';
import express, { Application, Request, Response } from 'express';
import { connectToDatabase } from './database/index';
import cors from 'cors';

export const app: Application = express();

app.use(cors({
  origin: 'http://localhost:3005'
}));

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

if (require.main === module) {
  app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Hello server, running on port ${port}`);
  });
}

module.exports = app;
