// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerJsdoc, { OAS3Options } from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import { FRONTEND_ORIGIN } from '../configs/environment';
import { definition } from '../configs/swagger';

import { router as assignmentRouter } from './assignment';
import { router as authRouter } from './auth';
import { addCourse, getCourse } from '../controllers/course';
import {
  addCourseInstance, getAllCourseInstances, getCourseInstance
} from '../controllers/courseInstance';
import { fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu } from '../controllers/sisu';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';
import { router as userRouter } from './user';

const options: object = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification: OAS3Options = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(assignmentRouter);
router.use(authRouter);
router.use(userRouter);

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(openapiSpecification));

// User routes

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwtCookie:
 *       type: apiKey
 *       in: cookie
 *       name: jwt
 * definitions:
 *   Failure:
 *     type: object
 *     description: A reason for a failure, with a chiefly developer-facing error message.
 *     properties:
 *       success:
 *         type: boolean
 *         description: '`false` to indicate failure.'
 *         example: false
 *       errors:
 *         type: array
 *         items:
 *           type: string
 *         description: An error message to explain the error.
 *   CourseData:
 *     type: object
 *     description: Course Information
 *     properties:
 *       id:
 *         type: integer
 *         description: Course ID
 *       courseCode:
 *         type: string
 *         description: Course Code
 *       department:
 *         type: object
 *         description: Object containing department with localization
 *         properties:
 *           fi:
 *             type: string
 *           sv:
 *             type: string
 *           en:
 *             type: string
 *       name:
 *         type: object
 *         description: Object containing course name with localization
 *         properties:
 *           fi:
 *             type: string
 *           sv:
 *             type: string
 *           en:
 *             type: string
 *       evaluationInformation:
 *         type: object
 *         description: Object containing course evaluation information with localization
 *         properties:
 *           fi:
 *             type: string
 *           sv:
 *             type: string
 *           en:
 *             type: string
 */

// Sisu API routes

/**
 * @swagger
 * /v1/sisu/courses/{courseCode}:
 *   get:
 *     tags: [Course, SISU]
 *     description: Fetch All Instances of a Course from SISU
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: True
 *         schema:
 *           type: string
 *         description: The course code of the course to be fetched from SISU
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.get('/v1/sisu/courses/:courseCode', controllerDispatcher(fetchAllCourseInstancesFromSisu));

/**
 * @swagger
 * /v1/sisu/instances/{sisuCourseInstanceId}:
 *   get:
 *     tags: [Course, SISU]
 *     description: Fetch Course Instance Information from SISU
 *     parameters:
 *       - in: path
 *         name: sisuCourseInstanceId
 *         required: True
 *         schema:
 *           type: string
 *         description: InstanceID of a course instance in sisu
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.get(
  '/v1/sisu/instances/:sisuCourseInstanceId',
  controllerDispatcher(fetchCourseInstanceFromSisu)
);

// Course and instance routes
/**
 * @swagger
 * /v1/courses:
 *   post:
 *     tags: [Course]
 *     description: Add a course
 *     requestBody:
 *       description: Description of add course POST body
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.post(
  '/v1/courses',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addCourse)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances:
 *   post:
 *     tags: [Course]
 *     description: Add a course instance to a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: string
 *         description: The CourseID to add the instance to
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
router.post(
  '/v1/courses/:courseId/instances',
  express.json(),
  controllerDispatcher(addCourseInstance)
);

/**
 * @swagger
 * /v1/courses/{courseId}:
 *   get:
 *     tags: [Course]
 *     description: Get Course Information
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: string
 *         description: The ID of the fetched course
 *     responses:
 *       200:
 *         description: Course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request
 *                 course:
 *                   $ref: '#/definitions/Course'
 */
router.get('/v1/courses/:courseId', controllerDispatcher(getCourse));

/**
 * @swagger
 * definitions:
 *   Instance:
 *     type: object
 *     description: Course Instance Information
 *     properties:
 *       id:
 *         type: integer
 *         description: Course ID
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
 * /v1/instances/{instanceId}:
 *   get:
 *     tags: [Course]
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
router.get('/v1/instances/:instanceId', controllerDispatcher(getCourseInstance));

// TODO: Swagger documentation.
router.get('/v1/courses/:courseId/instances', controllerDispatcher(getAllCourseInstances));

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
