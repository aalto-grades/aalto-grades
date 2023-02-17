// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Router } from 'express';
import swaggerJsdoc, { OAS3Options } from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import { FRONTEND_ORIGIN } from '../configs/environment';
import { definition } from '../configs/swagger';

import { router as authRouter } from './auth';
import { fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu } from '../controllers/sisu';
import { router as courseRouter } from './course';
import { router as courseInstanceRouter } from './courseInstance';
import { controllerDispatcher } from '../middleware/errorHandler';
import { router as userRouter } from './user';

const options: OAS3Options = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(authRouter);
router.use(courseRouter);
router.use(courseInstanceRouter);
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
 */

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

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
