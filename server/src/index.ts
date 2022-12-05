// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Application, Request, Response } from 'express';
import { TeacherCourses, getTeacherCourses } from './services/courses';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

app.get('/v1/user/courses', async (req: Request, res: Response) => {
  try {
    const courses: TeacherCourses = await getTeacherCourses(0);
    res.send({
      success: true,
      courses: courses,
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Hello server, running on port ${port}`);
  });
}

module.exports = app;