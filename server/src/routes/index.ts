// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { getCourse, getInstance, addCourse } from '../controllers/course';
import { testDbFindAllUsers, testDbFindAllCourses } from '../controllers/test';

export const router: Router = Router();

// User routes
router.get('/v1/user/:userId/courses', getUserCourses);

// Course and instance routes
router.post('/v1/courses', express.json(), addCourse);
router.get('/v1/courses/:courseId', getCourse);
router.get('/v1/instances/:instanceId', getInstance);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db', testDbFindAllUsers);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db/courses/:langId', testDbFindAllCourses);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});
