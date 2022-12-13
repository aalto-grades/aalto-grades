// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { testDbFindAllUsers, testDbFindAllCourses } from '../controllers/test';
import { authLogin, authSelfInfo, authSignup } from './login';
import passport from 'passport';

export const router: Router = Router();

router.get('/user/:userId/courses', getUserCourses);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db', testDbFindAllUsers);

// TODO: remove this test endpoint after working endpoint has been added
router.get('/v1/test/db/courses/:langId', testDbFindAllCourses);

router.post('/v1/auth/login', express.json(), authLogin);
router.post('/v1/auth/signup', express.json(), authSignup);
router.get('/v1/auth/self-info', passport.authenticate('jwt', { session: false }), express.json(), authSelfInfo);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

