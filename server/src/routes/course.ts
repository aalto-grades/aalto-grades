// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import { SystemRole } from 'aalto-grades-common/types';
import { addCourse, editCourse, getAllCourses, getCourse } from '../controllers/course';
import { handleInvalidRequestJson } from '../middleware';
import { authorization } from '../middleware/authorization';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   LocalizedString:
 *     type: object
 *     description: >
 *       Object containing translations of a string in Finnish, Swedish, and English.
 *     properties:
 *       fi:
 *         type: string
 *         description: Finnish translation.
 *         example: Ohjelmointi 1
 *       sv:
 *         type: string
 *         description: Swedish translation.
 *         example: Programmering 1
 *       en:
 *         type: string
 *         description: English translation.
 *         example: Programming 1
 *   CourseId:
 *     type: integer
 *     description: Internal course database ID.
 *     format: int32
 *     minimum: 1
 *     example: 1
 *   CourseCode:
 *     type: string
 *     description: Aalto Course code.
 *     example: CS-A1110
 *   MinCredits:
 *     type: integer
 *     description: Minimum amount credits student can receive from passing the course.
 *     example: 3
 *   MaxCredits:
 *     type: integer
 *     description: Maximum amount credits student can receive from passing the course.
 *     example: 5
 *   TeachersInCharge:
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Teacher's email address.
 *           example: john.doe@aalto.fi
 *   CourseData:
 *     type: object
 *     description: Course general information with translations.
 *     properties:
 *       id:
 *         $ref: '#/definitions/CourseId'
 *       courseCode:
 *         $ref: '#/definitions/CourseCode'
 *       minCredits:
 *         $ref: '#/definitions/MinCredits'
 *       maxCredits:
 *         $ref: '#/definitions/MaxCredits'
 *       department:
 *         $ref: '#/definitions/LocalizedString'
 *       name:
 *         $ref: '#/definitions/LocalizedString'
 *       evaluationInformation:
 *         $ref: '#/definitions/LocalizedString'
 *       teachersInCharge:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: Database ID of the teacher.
 *               example: 42
 *             name:
 *               type: string
 *               description: Teacher's name.
 *               example: John Doe
 */

/**
 * @swagger
 * /v1/courses/{courseId}:
 *   get:
 *     tags: [Course]
 *     description: Get course information.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         description: >
 *           A course with the given ID was found and information about it is
 *           returned in the CourseData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/CourseData'
 *       400:
 *         description: Course ID validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCourse)
);

/**
 * @swagger
 * /v1/courses:
 *   get:
 *     tags: [Course]
 *     description: Get information about all courses.
 *     responses:
 *       200:
 *         description: >
 *           All of the courses in the database in the CourseData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/CourseData'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAllCourses)
);

/**
 * @swagger
 * /v1/courses:
 *   post:
 *     tags: [Course]
 *     description: Create a new course. Only for users with admin rights.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 $ref: '#/definitions/CourseCode'
 *               minCredits:
 *                 $ref: '#/definitions/MinCredits'
 *               maxCredits:
 *                 $ref: '#/definitions/MaxCredits'
 *               department:
 *                 $ref: '#/definitions/LocalizedString'
 *               name:
 *                 $ref: '#/definitions/LocalizedString'
 *               teachersInCharge:
 *                 $ref: '#/definitions/TeachersInCharge'
 *     responses:
 *       200:
 *         description: The course was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/CourseId'
 *       400:
 *         description: A validation error has occurred in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       422:
 *         description: Teacher(s) not found based on email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses',
  passport.authenticate('jwt', { session: false }),
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addCourse)
);

/**
 * @swagger
 * /v1/courses:
 *   put:
 *     tags: [Course]
 *     description: Edit an existing course. Only for users with admin rights.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 $ref: '#/definitions/CourseCode'
 *               minCredits:
 *                 $ref: '#/definitions/MinCredits'
 *               maxCredits:
 *                 $ref: '#/definitions/MaxCredits'
 *               department:
 *                 $ref: '#/definitions/LocalizedString'
 *               name:
 *                 $ref: '#/definitions/LocalizedString'
 *               teachersInCharge:
 *                 $ref: '#/definitions/TeachersInCharge'
 *     responses:
 *       200:
 *         description: The course was successfully edited.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/CourseData'
 *       400:
 *         description: A validation error has occurred in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: Teacher(s) not found based on email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.put(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', { session: false }),
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(editCourse)
);
