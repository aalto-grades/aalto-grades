// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';

import { FRONTEND_ORIGIN } from '../configs/environment';

import { authLogin, authLogout, authSelfInfo, authSignup } from '../controllers/auth';
import { addCourse, getCourse } from '../controllers/course';
import { addCourseInstance, getCourseInstance } from '../controllers/courseInstance';
import { fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu } from '../controllers/sisu';
import { getCoursesOfUser } from '../controllers/user';
import { handleInvalidRequestJson } from '../middleware';

export const router: Router = Router();

router.use(cookieParser());

// User routes.
router.get('/v1/user/:userId/courses', getCoursesOfUser);

// Sisu API routes.
router.get('/v1/courses/sisu/:courseId', fetchAllCourseInstancesFromSisu);
router.get('/v1/courses/sisu/instance/:instanceId', fetchCourseInstanceFromSisu);

// Course routes.
router.post('/v1/courses', express.json(), handleInvalidRequestJson, addCourse);
router.get('/v1/courses/:courseId', getCourse);

// Course instance routes.
router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);
router.get('/v1/instances/:instanceId', getCourseInstance);

// User management routes.
router.post('/v1/auth/login', express.json(), authLogin);

router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authLogout
);

router.post('/v1/auth/signup', express.json(), authSignup);

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authSelfInfo
);

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
