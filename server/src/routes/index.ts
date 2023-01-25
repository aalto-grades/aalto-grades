// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { addCourse, addCourseInstance, fetchAllInstancesFromSisu, fetchInstanceFromSisu } from '../controllers/course';
import { testDbFindAllUsers, testDbFindAllCourses } from '../controllers/test';
import { authLogin, authLogout, authSelfInfo, authSignup } from './login';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { frontendOrigin } from '../configs';

export const router: Router = Router();

router.use(cookieParser());

router.get('/v1/user/:userId/courses', getUserCourses);

// Sisu API routes
router.get('/v1/courses/sisu/:courseId', fetchAllInstancesFromSisu);
router.get('/v1/courses/sisu/instance/:instanceId', fetchInstanceFromSisu);

router.post('/v1/courses', express.json(), addCourse);

router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db', testDbFindAllUsers);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db/courses/:langId', testDbFindAllCourses);

router.post('/v1/auth/login', express.json(), authLogin);
router.post('/v1/auth/logout', passport.authenticate('jwt', { session: false }), express.json(), authLogout);
router.post('/v1/auth/signup', express.json(), authSignup);
router.get('/v1/auth/self-info', passport.authenticate('jwt', { session: false }), express.json(), authSelfInfo);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

router.use(cors({
  origin: frontendOrigin,
  credentials: true, 
}));
