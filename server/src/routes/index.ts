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
router.get('/v1/user/:userId/courses', getUserCourses);

// Sisu API routes

/**
 * @swagger
 * /v1/courses/sisu/{courseId}:
 *   get:
 *     tags: [Course, SISU]
 *     description: Fetch All Instances of a Course from SISU
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: string
 *         description: The ID of the course to be fetched from SISU
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.get('/v1/courses/sisu/:courseId', fetchAllInstancesFromSisu);

/**
 * @swagger
 * /v1/courses/sisu/instance/{instanceId}:
 *   get:
 *     tags: [Course, SISU]
 *     description: Fetch Course Instance Information from SISU
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: True
 *         schema:
 *           type: string
 *         description: InstanceID of a course instance
 *     responses:
 *       200:
 *         description: User's Courses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserCourses'
 */
router.get('/v1/courses/sisu/instance/:instanceId', fetchInstanceFromSisu);

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
router.post('/v1/courses/:courseId/instances', express.json(), addCourseInstance);

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
 *         description: User's Courses
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
router.get('/v1/instances/:instanceId', getInstance);


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
router.post('/v1/auth/logout', passport.authenticate('jwt', { session: false }), express.json(), authLogout);

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
router.get('/v1/auth/self-info', passport.authenticate('jwt', { session: false }), express.json(), authSelfInfo);


router.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));
