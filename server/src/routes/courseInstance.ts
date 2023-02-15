// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import {
  addCourseInstance, getAllCourseInstances, getCourseInstance
} from '../controllers/courseInstance';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   CourseInstanceData:
 *     type: object
 *     description: Course instance information.
 *     properties:
 *       id:
 *         type: integer
 *         description: Course instance ID.
 *       startingPeriod:
 *         type: string
 *         description: Starting Period as String
 *       endingPeriod:
 *         type: string
 *         description: Ending Period as String
 *       minCredits:
 *         type: integer
 *       maxCredits:
 *         type: integer
 *       startDate:
 *         type: string
 *         description: Starting date in format year-month-day
 *       endDate:
 *         type: string
 *         description: Ending date in format year-month-day
 *       courseType:
 *         type: string
 *       gradingType:
 *         type: string
 *       responsibleTeacher:
 *         type: string
 *         description: name of responsible teacher
 *       courseData:
 *         $ref: '#/definitions/Course'
 */

/**
 * @swagger
 * /v1/courses/instances/{instanceId}:
 *   get:
 *     tags: [CourseInstance]
 *     description: Get a course instance
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: True
 *         schema:
 *           type: string
 *         description: The ID of the fetched course instance
 *     responses:
 *       200:
 *         description: Instance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request
 *                 course:
 *                   $ref: '#/definitions/Instance'
 */
router.get('/v1/courses/instances/:instanceId', getCourseInstance);

// TODO: Swagger documentation.
router.get('/v1/courses/:courseId/instances', getAllCourseInstances);


/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   post:
 *     tags: [CourseInstance]
 *     description: Add a course instance to a course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: string
 *         description: The ID of the course to add the instance to.
 *     requestBody:
 *       description: Description of add course instance POST body
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);
