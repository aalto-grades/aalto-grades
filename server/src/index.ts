// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { port } from './configs';
import { app } from './routes';
import { validateLogin, InvalidCredentials } from './services/auth';
import { TeacherCourses, getTeacherCourses } from './services/courses';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';

require('./routes/login');

app.use(cors({
  origin: 'http://localhost:3005'
}));

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const role = await validateLogin(username, password);
        return done(null, role, { message: 'success' });
      } catch (error) {
        if (error instanceof InvalidCredentials) {
          return done(null, false, { message: 'invalid credentials' });
        }
        return done(error);
      }
    }
  ),
);

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
