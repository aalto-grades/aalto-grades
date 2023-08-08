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

import { router as assessmentModelRouter } from './assessmentModel';
import { router as attainmentRouter } from './attainment';
import { router as authRouter } from './auth';
import { router as courseRouter } from './course';
import { router as courseInstanceRouter } from './courseInstance';
import { router as formulaRouter } from './formula';
import { router as gradesRouter } from './grades';
import { router as sisuRouter } from './sisu';
import { router as userRouter } from './user';

const options: OAS3Options = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(assessmentModelRouter);
router.use(attainmentRouter);
router.use(authRouter);
router.use(courseRouter);
router.use(courseInstanceRouter);
router.use(formulaRouter);
router.use(gradesRouter);
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
 *
 *   parameters:
 *     courseId:
 *       in: path
 *       name: courseId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the course.
 *     instanceId:
 *       in: path
 *       name: instanceId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the course instance.
 *     assessmentModelId:
 *       in: path
 *       name: assessmentModelId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the assessment model.
 *     formulaId:
 *       in: path
 *       name: formulaId
 *       schema:
 *         type: string
 *       required: true
 *       example: WEIGHTED_AVERAGE
 *       description: Enum value identifying the grading formula.
 *     attainmentId:
 *       in: path
 *       name: attainmentId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the study attainment.
 *     gradeId:
 *       in: path
 *       name: gradeId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the user grade.
 *     tree:
 *       in: query
 *       name: tree
 *       schema:
 *         type: string
 *         enum: [children, descendants]
 *       description: >
 *         The type of the attainment tree fetched. Optional.
 *          * `children` - Fetch only the direct subattainments of the attainment.
 *          * `descendants` - Fetch the whole tree of subattainments.
 *     studentNumbers:
 *       in: query
 *       name: studentNumbers
 *       schema:
 *         type: array
 *         description: List of student numbers.
 *         example: ['735333', '393518', '925163']
 *         items:
 *           type: string
 *     userId:
 *       in: path
 *       name: userId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: true
 *       example: 1
 *       description: The ID of the user.
 *     instanceIdQuery:
 *       in: query
 *       name: instanceId
 *       schema:
 *         type: integer
 *         format: int32
 *         minimum: 1
 *       required: false
 *       example: 1
 *       description: >
 *         The ID of the course instance. For filtering results based on course instance ID.
 *
 *   responses:
 *     AuthenticationError:
 *       description: Authentication credentials were missing or JWT expired.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Failure'
 *     AuthorizationError:
 *       description: The requester is not authorized to execute actions.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Failure'
 *
 * definitions:
 *   Failure:
 *     type: object
 *     description: A reason for a failure.
 *     properties:
 *       errors:
 *         type: array
 *         items:
 *           type: string
 *         description: Error message(s) explaining the error(s).
 *         example: ['course with ID 157 not found', 'course instance ID must be type of integer']
 */

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
