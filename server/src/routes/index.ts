// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import cookieParser from 'cookie-parser';
import cors from 'cors';
import {Router} from 'express';
import swaggerJsdoc, {type OAS3Options} from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import {router as aplusRouter} from './aplus';
import {router as authRouter} from './auth';
import {router as courseRouter} from './course';
import {router as coursePartRouter} from './coursePart';
import {router as courseTaskRouter} from './courseTask';
import {router as finalGradesRouter} from './finalGrade';
import {router as gradingModelRouter} from './gradingModel';
import {router as sisuRouter} from './sisu';
import {router as gradesRouter} from './taskGrade';
import {router as userRouter} from './user';
import {FRONTEND_ORIGIN} from '../configs/environment';
import {definition} from '../configs/swagger';

const options: OAS3Options = {
  definition,
  apis: ['./docs/*.yaml'],
};

const openapiSpecification: object = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(aplusRouter);
router.use(authRouter);
router.use(courseRouter);
router.use(coursePartRouter);
router.use(courseTaskRouter);
router.use(finalGradesRouter);
router.use(gradesRouter);
router.use(gradingModelRouter);
router.use(sisuRouter);
router.use(userRouter);

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(openapiSpecification));

router.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
