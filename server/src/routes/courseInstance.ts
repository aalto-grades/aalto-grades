// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import {
  addCourseInstance, getAllCourseInstances, getCourseInstance
} from '../controllers/courseInstance';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   Period:
 *     type: string
 *     description: >
 *       Teaching period (`Period`):
 *       `'I' | 'II' | 'III' | 'IV' | 'V'`.
 *   GradingType:
 *     type: string
 *     description: >
 *       Grading method (`GradingType`):
 *       `'PASFAIL' | 'NUMERICAL'`.
 *   TeachingMethod:
 *     type: string
 *     description: >
 *       Teaching method (`TeachingMethod`):
 *         `'LECTURE' | 'EXAM'`.
 *   CourseInstanceData:
 *     type: object
 *     description: Course instance information.
 *     properties:
 *       id:
 *         type: integer
 *         description: Internal course instance database ID.
 *       sisuCourseInstanceId:
 *         type: string
 *         description: ID of the corresponding course instance in Sisu.
 *       startingPeriod:
 *         $ref: '#/definitions/Period'
 *       endingPeriod:
 *         $ref: '#/definitions/Period'
 *       minCredits:
 *         type: integer
 *       maxCredits:
 *         type: integer
 *       startDate:
 *         type: string
 *         description: Starting date in format year-month-day.
 *       endDate:
 *         type: string
 *         description: Ending date in format year-month-day.
 *       teachingMethod:
 *         $ref: '#/definitions/TeachingMethod'
 *       gradingType:
 *         $ref: '#/definitions/GradingType'
 *       responsibleTeacher:
 *         type: string
 *         description: Name of the responsible teacher.
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
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the course the instance belongs to.
 *       - in: path
 *         name: instanceId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the desired course instance.
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
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseInstance:
 *                       $ref: '#/definitions/CourseInstanceData'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course
 *           instance ID is not a positive integer.
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
 */
router.get(
  '/v1/courses/:courseId/instances/:instanceId',
  controllerDispatcher(getCourseInstance)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   get:
 *     tags: [Course Instance]
 *     description: Get all instances of a course.
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the desired course.
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
 *                   type: boolean
 *                   description: Success of the request.
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
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/instances',
  controllerDispatcher(getAllCourseInstances)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   post:
 *     tags: [Course Instance]
 *     description: Add a course instance to a course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the course to add the instance to.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gradingType:
 *                 $ref: '#/definitions/GradingType'
 *               sisuCourseInstanceId:
 *                 type: string
 *                 description: ID of the corresponding course instance in Sisu.
 *               startingPeriod:
 *                 $ref: '#/definitions/Period'
 *               endingPeriod:
 *                 $ref: '#/definitions/Period'
 *               teachingMethod:
 *                 $ref: '#/definitions/TeachingMethod'
 *               responsibleTeacher:
 *                 type: integer
 *                 description: >
 *                   ID of the user to be assigned as the responsible teacher.
 *               minCredits:
 *                 type: integer
 *               maxCredits:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 description: Starting date in format year-month-day.
 *               endDate:
 *                 type: string
 *                 description: Ending date in format year-month-day.
 *     responses:
 *       200:
 *         description: The course instance was successfully added.
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the newly added course instance.
 *       400:
 *         description: >
 *           A validation error has occurred either in the URL or the request
 *           body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         description: The requester is not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       403:
 *         description: >
 *           The requester is not authorized to add a course instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
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
 */
router.post(
  '/v1/courses/:courseId/instances',
  express.json(),
  controllerDispatcher(addCourseInstance)
);
