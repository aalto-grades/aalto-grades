// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';

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
 *         type: boolean
 *         description: Success of the request.
 *       courses:
 *         type: object
 *         description: >
 *           Object with current and past courses the user has participated in.
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
 *     description: Get all courses the given user has participated in.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: True
 *         schema:
 *           type: integer
 *         description: ID of the user whose list of courses are to be retrieved.
 *     responses:
 *       200:
 *         description: Courses user has participated in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CoursesOfUser'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given user ID is
 *           not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         description: The requester is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       403:
 *         description: >
 *           The requester is not authorized to view the courses of the given
 *           user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: A user with the given user ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/user/:userId/courses',
  controllerDispatcher(getCoursesOfUser)
);
