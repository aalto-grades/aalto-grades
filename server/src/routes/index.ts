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

import { router as attainableRouter } from './attainable';
import { router as authRouter } from './auth';
import { router as courseRouter } from './course';
import { router as courseInstanceRouter } from './courseInstance';
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
router.use(attainableRouter);
router.use(authRouter);
router.use(courseRouter);
router.use(courseInstanceRouter);
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

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
