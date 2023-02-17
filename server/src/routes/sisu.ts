// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';

import {
  fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu
} from '../controllers/sisu';
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
 *         required: True
 *         schema:
 *           type: string
 *         description: >
 *           Course instance ID used in Sisu, e.g., aalto-CUR-163498-3084205.
 *     responses:
 *       200:
 *         description: >
 *           A course instance with the given ID was found in Sisu and
 *           information about it is returned in the CourseInstanceData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseInstance:
 *                       $ref: '#/definitions/CourseInstanceData'
 *       502:
 *         description: The Sisu API returned an error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/sisu/instances/:sisuCourseInstanceId',
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
 *         required: True
 *         schema:
 *           type: string
 *         description: Course code (e.g., CS-A1110) of the desired course.
 *     responses:
 *       200:
 *         description: >
 *           A course with instances with the given course code was found in
 *           Sisu and information about the course instances is returned in an
 *           array of objects in the CourseInstanceData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseInstances:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/CourseInstanceData'
 *       502:
 *         description: The Sisu API returned an error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/sisu/courses/:courseCode',
  controllerDispatcher(fetchAllCourseInstancesFromSisu)
);
