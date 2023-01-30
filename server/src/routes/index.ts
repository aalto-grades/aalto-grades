// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { addCourse, handleInvalidRequestJson, addCourseInstance, fetchAllInstancesFromSisu, fetchInstanceFromSisu, getCourse, getInstance, getAllCourseInstances } from '../controllers/course';
import { authLogin, authLogout, authSelfInfo, authSignup } from './login';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { frontendOrigin } from '../configs';

export const router: Router = Router();

router.use(cookieParser());

// User routes
router.get('/v1/user/:userId/courses', getUserCourses);

// Sisu API routes
router.get('/v1/courses/sisu/:courseId', fetchAllInstancesFromSisu);
router.get('/v1/courses/sisu/instance/:instanceId', fetchInstanceFromSisu);

// Course and instance routes
router.post('/v1/courses', express.json(), handleInvalidRequestJson, addCourse);
router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);

router.get('/v1/courses/:courseId', getCourse);
router.get('/v1/courses/:courseId/instances', getAllCourseInstances);
router.get('/v1/instances/:instanceId', getInstance);

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
