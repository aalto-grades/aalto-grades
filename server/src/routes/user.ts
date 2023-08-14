// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import { getCoursesOfUser, getUserInfo } from '../controllers/user';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   UserData:
 *     type: object
 *     description: User's personal information.
 *     properties:
 *       id:
 *         type: integer
 *         description: Internal user database ID.
 *         format: int32
 *         minimum: 1
 *         example: 1
 *       studentNumber:
 *         $ref: '#/definitions/StudentNumber'
 *       name:
 *         type: string
 *         description: User's name.
 *         example: Eddy Engineer
 *       email:
 *         type: string
 *         description: User's email address.
 *         example: Eddy.Engineer@aalto.fi
 */

/**
 * @swagger
 * /v1/user/{userId}/courses:
 *   get:
 *     tags: [User]
 *     description: >
 *       Get all courses the given user has or is currently participating in.
 *       Regular users can only access their own course list. Admin users can
 *       access the courses of any user.
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Courses the user has participated in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/CourseData'
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

/**
 * @swagger
 * /v1/user/{userId}:
 *   get:
 *     tags: [User]
 *     description: >
 *       Get information of the user based on ID. Regular users can only access
 *       their own information. Admin users can access the information of any user.
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: User information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserData'
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
  '/v1/user/:userId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getUserInfo)
);
