// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { port } from './configs';
import { app } from './routes';
import { validateLogin, InvalidCredentials } from './services/auth';
import express, { Application, Request, Response } from 'express';
import { connectToDatabase, sequelize } from './database/index';
import { QueryTypes } from 'sequelize';
import models from './database/models';
import { TeacherCourses, getTeacherCourses } from './services/courses';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';

require('./routes/login');

// TODO: remove this test endpoint after working endpoint has been added
app.get('/v1/test/db', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: await models.User.findAll(),
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

// TODO: remove this test endpoint after working endpoint has been added
app.get('/v1/test/db/courses/:langId', async (req: Request, res: Response) => {
  try {
    const language: string = req.params.langId.toUpperCase(); // uppercase to avoid invalid enum error
    res.json({
      success: true,
      data: await sequelize.query(
        `SELECT
          course.id,
          course.course_code AS "courseCode",
          course_translation.department,
          course_translation.course_name "courseName",
          course.min_credits AS "minCredits",
          course.max_credits AS "maxCredits"
        FROM course INNER JOIN
            course_translation ON course_translation.course_id = course.id
        WHERE language = :language`,
        {
          replacements: {
            language: language
          },
          model: models.Course,
          type: QueryTypes.SELECT,
          raw: true
        })
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
  app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Hello server, running on port ${port}`);
  });
}

module.exports = app;
