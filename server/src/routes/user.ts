// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import { getCoursesOfUser } from '../controllers/user';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   CoursesOfUser:
 *     type: object
 *     properties:
 *       success:
 *         $ref: '#/definitions/Success'
 *       courses:
 *         type: object
 *         description: >
 *           Users current and past course participations.
 *         properties:
 *           current:
 *             type: array
 *             description: >
 *               Courses which have a currently active instance the user is
 *               participating in.
 *             items:
 *               $ref: '#/definitions/CourseData'
 *           previous:
 *             type: array
 *             description: >
 *               Courses which do not have a currently active instance the user
 *               has previously participated in.
 *             items:
 *               $ref: '#/definitions/CourseData'
 */

/**
 * @swagger
 * /v1/user/{userId}/courses:
 *   get:
 *     tags: [User]
 *     description: Get all courses the given user has or is currently participated in.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: True
 *         schema:
 *           type: integer
 *         description: ID of the user whose list of courses are to be retrieved.
 *         example: 12345
 *     responses:
 *       200:
 *         description: Courses user has participated in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CoursesOfUser'
 *       400:
 *         description: User ID validation failed. Must be positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: A user with the given user ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/user/:userId/courses',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCoursesOfUser)
);
