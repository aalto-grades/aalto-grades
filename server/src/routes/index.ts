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
 * definitions:
 *   Course:
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
 * 
 *   UserCourses:
 *     type: object
 *     properties: 
 *       success:
 *         type: boolean
 *         description: Success of the request
 *       courses:
 *         type: object
 *         description: Object with current and past courses
 *         properties:
 *           current:
 *             type: array
 *             description: Current Courses
 *             items:
 *               $ref: '#/definitions/Course'
 *           previous:
 *             type: array
 *             description: Previous Courses
 *             items:
 *               $ref: '#/definitions/Course'
 */
/**
 * @swagger
 * /v1/user/{userId}/courses:
 *   get:
 *     tags: [Courses]
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
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
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
