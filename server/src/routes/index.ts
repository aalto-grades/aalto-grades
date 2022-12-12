// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses, addCourse } from '../controllers/user';
import { testDbFindAllUsers, testDbFindAllCourses } from '../controllers/test';

export const router: Router = Router();

router.get('/user/:userId/courses', getUserCourses);

router.post('/user/:userId/courses', express.json(), addCourse);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db', testDbFindAllUsers);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db/courses/:langId', testDbFindAllCourses);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});
