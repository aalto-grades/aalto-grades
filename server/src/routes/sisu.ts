// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';

import {
  fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu
} from '../controllers/sisu';
import { authorization } from '../middleware/authorization';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * /v1/sisu/instances/{sisuCourseInstanceId}:
 *   get:
 *     tags: [Sisu]
 *     description: >
 *       Fetch information about a particular course instance from Sisu.
 *     parameters:
 *       - in: path
 *         name: sisuCourseInstanceId
 *         required: true
 *         example: aalto-CUR-163498-3084205
 *         schema:
 *           type: string
 *         description: Course instance ID used in Sisu.
 *     responses:
 *       200:
 *         description: >
 *           A course instance with the given ID was found in Sisu.
 *           Instance information returned in the CourseInstanceData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseInstance:
 *                       $ref: '#/definitions/CourseInstanceData'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       502:
 *         description: The Sisu API returned an error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/sisu/instances/:sisuCourseInstanceId',
  authorization,
  controllerDispatcher(fetchCourseInstanceFromSisu)
);

/**
 * @swagger
 * /v1/sisu/courses/{courseCode}:
 *   get:
 *     tags: [Sisu]
 *     description: >
 *       Fetch information about all instances of a particular course from Sisu.
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         example: CS-A1110
 *         schema:
 *           type: string
 *         description: Course code of the desired course.
 *     responses:
 *       200:
 *         description: A course including instances found with the given course code.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseInstances:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/CourseInstanceData'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       502:
 *         description: The Sisu API returned an error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/sisu/courses/:courseCode',
  authorization,
  controllerDispatcher(fetchAllCourseInstancesFromSisu)
);
