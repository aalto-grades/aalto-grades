// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Router} from 'express';
// import {RequestHandler} from 'express-serve-static-core';
// import passport from 'passport';

import {fetchAplusExerciseData} from '../controllers/aplus';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

// TODO: Authorization?
router.get(
  '/v1/aplus/courses/:aplusCourseId',
  // Temporarily commented out for testing purposes
  // passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(fetchAplusExerciseData)
);
