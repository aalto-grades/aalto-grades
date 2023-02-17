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

import { router as authRouter } from './auth';
import { addCourse, getCourse } from '../controllers/course';
import { router as courseInstanceRouter } from './courseInstance';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';
import { router as sisuRouter } from './sisu';
import { router as userRouter } from './user';

const options: OAS3Options = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(authRouter);
router.use(courseInstanceRouter);
router.use(sisuRouter);
router.use(userRouter);

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(openapiSpecification));

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

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
