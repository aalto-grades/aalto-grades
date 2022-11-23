// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Application, Request, Response } from 'express';
import { connectToDatabase } from './src/database';
import Course from './src/database/models/course';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

app.get('/v1/test/db', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: await Course.findAll(),
    });
  } catch (err) {
    res.status(500);
    console.log('DB test error:', err);
    res.json({
      success: false,
      error: '',
    });
  }
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`Hello server, running on port ${port}`);
});
