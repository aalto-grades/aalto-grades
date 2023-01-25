// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { addCourse, fetchAllInstancesFromSisu, fetchInstanceFromSisu } from '../controllers/course';
import { testDbFindAllUsers, testDbFindAllCourses } from '../controllers/test';
import { getAllCourseInstances } from '../controllers/course';

export const router: Router = Router();

router.get('/v1/user/:userId/courses', getUserCourses);

// Sisu API routes
router.get('/v1/courses/sisu/:courseId', fetchAllInstancesFromSisu);
router.get('/v1/courses/sisu/instance/:instanceId', fetchInstanceFromSisu);

router.post('/v1/courses', express.json(), addCourse);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db', testDbFindAllUsers);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db/courses/:langId', testDbFindAllCourses);

router.get('/v1/courses/:courseId/instances', getAllCourseInstances);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});
