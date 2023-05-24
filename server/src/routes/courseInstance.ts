// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import {
  addCourseInstance, getAllCourseInstances, getCourseInstance
} from '../controllers/courseInstance';
import { authorization } from '../middleware/authorization';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   Period:
 *     type: string
 *     enum: [I, II, III, IV, V]
 *     description: Teaching period.
 *     example: III
 *   GradingScale:
 *     type: string
 *     enum: [PASS_FAIL, NUMERICAL, SECOND_NATIONAL_LANGUAGE]
 *     description: Course instance specific grading method.
 *     example: NUMERICAL
 *   CourseInstanceId:
 *     type: integer
 *     description: Internal course instance database ID.
 *     format: int32
 *     minimum: 1
 *     example: 1
 *   SisuCourseInstanceId:
 *     type: string
 *     description: ID of the corresponding course instance in Sisu.
 *     example: aalto-CUR-163498-3084205
 *   CourseInstanceData:
 *     type: object
 *     description: Course instance information.
 *     properties:
 *       id:
 *        $ref: '#/definitions/CourseInstanceId'
 *       sisuCourseInstanceId:
 *        $ref: '#/definitions/SisuCourseInstanceId'
 *       startingPeriod:
 *         $ref: '#/definitions/Period'
 *       endingPeriod:
 *         $ref: '#/definitions/Period'
 *       minCredits:
 *         type: integer
 *         description: Minimum amount credits student can receive from passing the course.
 *         example: 3
 *       maxCredits:
 *         type: integer
 *         description: Maximum amount credits student can receive from passing the course.
 *         example: 5
 *       startDate:
 *         type: string
 *         format: date
 *         description: Starting date in format year-month-day.
 *         example: 2022-9-22
 *       endDate:
 *         type: string
 *         format: date
 *         description: Ending date in format year-month-day.
 *         example: 2022-12-6
 *       type:
 *         type: string
 *         description: Type of course instance, 'Lecture', 'Exam', etc.
 *         example: Lecture
 *       gradingScale:
 *         $ref: '#/definitions/GradingScale'
 *       teachersInCharge:
 *         type: array
 *         description: Names of all teachers in charge of this course instance.
 *         example: ['John Doe', 'Jane Doe']
 *         items:
 *           type: string
 *       courseData:
 *         $ref: '#/definitions/CourseData'
 */

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}:
 *   get:
 *     tags: [Course Instance]
 *     description: Get information about a course instance.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *     responses:
 *       200:
 *         description: >
 *           A course instance with the given ID was found and information
 *           about it is returned in the CourseInstanceData format.
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
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course
 *           or course instance ID is not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         description: The requester is not authorized to delete attainments.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: >
 *           A course with the given course ID or a course instance with the
 *           given instance ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The found course instance with the given instance ID does not belong
 *           to the course with the given course ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses/:courseId/instances/:instanceId',
  authorization,
  controllerDispatcher(getCourseInstance)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   get:
 *     tags: [Course Instance]
 *     description: Get all instances of a course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         description: >
 *           A course with the given ID was found and a list of all of its
 *           instances is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: array
 *                   description: All instances of the course with the given ID.
 *                   items:
 *                     $ref: '#/definitions/CourseInstanceData'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course ID is
 *           not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses/:courseId/instances',
  authorization,
  controllerDispatcher(getAllCourseInstances)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   post:
 *     tags: [Course Instance]
 *     description: Add a course instance to a course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gradingScale:
 *                 $ref: '#/definitions/GradingScale'
 *               sisuCourseInstanceId:
 *                 type: string
 *                 $ref: '#/definitions/SisuCourseInstanceId'
 *               startingPeriod:
 *                 $ref: '#/definitions/Period'
 *               endingPeriod:
 *                 $ref: '#/definitions/Period'
 *               type:
 *                 type: string
 *                 description: Type of course instance, 'Lecture', 'Exam', etc.
 *                 example: Lecture
 *               teachersInCharge:
 *                 type: array
 *                 example: [1, 2, 3]
 *                 description: >
 *                   IDs of the users to be assigned as teachers in charge of
 *                   this course instance.
 *                 items:
 *                   type: integer
 *               minCredits:
 *                 type: integer
 *                 description: Minimum amount credits student can receive from passing the course.
 *                 example: 3
 *               maxCredits:
 *                 type: integer
 *                 description: Maximum amount credits student can receive from passing the course.
 *                 example: 5
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Starting date in format year-month-day.
 *                 example: 2022-9-22
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ending date in format year-month-day.
 *                 example: 2022-12-6
 *     responses:
 *       200:
 *         description: The course instance was successfully added.
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           $ref: '#/definitions/CourseInstanceId'
 *       400:
 *         description: >
 *           A validation error has occurred either in the URL or the request
 *           body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: >
 *           A user with the given responsible teacher ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses/:courseId/instances',
  authorization,
  express.json(),
  controllerDispatcher(addCourseInstance)
);
