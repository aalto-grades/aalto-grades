// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import cookieParser from 'cookie-parser';
import cors from 'cors';
import {Router} from 'express';
import swaggerJsdoc, {OAS3Options} from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import {FRONTEND_ORIGIN} from '../configs/environment';
import {definition} from '../configs/swagger';

import {router as aplusRouter} from './aplus';
import {router as assessmentModelRouter} from './assessmentModel';
import {router as attainmentRouter} from './attainment';
import {router as authRouter} from './auth';
import {router as courseRouter} from './course';
import {router as finalGradesRouter} from './finalGrades';
import {router as gradesRouter} from './grades';
import {router as userRouter} from './user';

const options: OAS3Options = {
  definition,
  apis: ['./docs/*.yaml'],
};

const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(aplusRouter);
router.use(assessmentModelRouter);
router.use(attainmentRouter);
router.use(authRouter);
router.use(courseRouter);
router.use(finalGradesRouter);
router.use(gradesRouter);
router.use(userRouter);

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(openapiSpecification));

router.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
