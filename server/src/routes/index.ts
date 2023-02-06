// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';
import { addCourse, handleInvalidRequestJson, addCourseInstance, fetchAllInstancesFromSisu, fetchInstanceFromSisu, getCourse, getInstance } from '../controllers/course';
import { authLogin, authLogout, authSelfInfo, authSignup } from './login';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { frontendOrigin } from '../configs';
import { definition } from './swagger';

import swaggerUI from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.serve, swaggerUI.setup(openapiSpecification));

// User routes


/**
 * @swagger
 * /v1/user/{userId}/courses:
 *   get:
 *     tags: [User, Courses]
 *     description: Fetch Courses of a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the user fetching courses
 *     responses:
 *       200:
 *         description: Get Users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID.
 *                 username:
 *                   type: string
 *                   description: The user name.
 */
router.get('/v1/user/:userId/courses', getUserCourses);

// Sisu API routes
router.get('/v1/courses/sisu/:courseId', fetchAllInstancesFromSisu);
router.get('/v1/courses/sisu/instance/:instanceId', fetchInstanceFromSisu);

// Course and instance routes
router.post('/v1/courses', express.json(), handleInvalidRequestJson, addCourse);
router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);

router.get('/v1/courses/:courseId', getCourse);
router.get('/v1/instances/:instanceId', getInstance);

router.post('/v1/auth/login', express.json(), authLogin);
router.post('/v1/auth/logout', passport.authenticate('jwt', { session: false }), express.json(), authLogout);
router.post('/v1/auth/signup', express.json(), authSignup);
router.get('/v1/auth/self-info', passport.authenticate('jwt', { session: false }), express.json(), authSelfInfo);


router.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));
