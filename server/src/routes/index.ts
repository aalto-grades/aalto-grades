// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import swaggerJsdoc, { OAS3Options } from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import { FRONTEND_ORIGIN } from '../configs/environment';
import { definition } from '../configs/swagger';

import { authLogin, authLogout, authSelfInfo, authSignup } from '../controllers/auth';
import { addCourse, getCourse } from '../controllers/course';
import { fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu } from '../controllers/sisu';
import { getCoursesOfUser } from '../controllers/user';
import { router as courseInstanceRouter } from './courseInstance';
import { handleInvalidRequestJson } from '../middleware';

const options: object = {
  definition,
  apis: ['./src/routes/*.ts'],
};

const openapiSpecification: OAS3Options = swaggerJsdoc(options);

export const router: Router = Router();

router.use(cookieParser());
router.use(courseInstanceRouter);

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(openapiSpecification));

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
 *     tags: [Course]
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
router.get('/v1/user/:userId/courses', getCoursesOfUser);

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
router.get('/v1/sisu/courses/:courseCode', fetchAllCourseInstancesFromSisu);

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
router.get('/v1/sisu/instances/:sisuCourseInstanceId', fetchCourseInstanceFromSisu);

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
router.post('/v1/courses', express.json(), handleInvalidRequestJson, addCourse);

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
router.get('/v1/courses/:courseId', getCourse);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     tags: [Session]
 *     description: Login with User
 *     requestBody:
 *       description: Description of login POST body
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.post('/v1/auth/login', express.json(), authLogin);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     tags: [Session]
 *     description: Logout of user
 *     requestBody:
 *       description: Description of logout POST body
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authLogout
);

/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     tags: [Session]
 *     description: Sign Up user
 *     requestBody:
 *       description: Description of signup POST body
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
router.post('/v1/auth/signup', express.json(), authSignup);

/**
 * @swagger
 * /v1/auth/self-info:
 *   get:
 *     tags: [Session]
 *     description: Fetch Courses of a user
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authSelfInfo
);

router.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
