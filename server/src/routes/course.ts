// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import { addCourse, getAllCourses, getCourse } from '../controllers/course';
import { handleInvalidRequestJson } from '../middleware';
import { authorization } from '../middleware/authorization';
import { controllerDispatcher } from '../middleware/errorHandler';
import { UserRole } from '../types/general';

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
 *   CourseData:
 *     type: object
 *     description: Course general information with translations.
 *     properties:
 *       id:
 *         $ref: '#/definitions/CourseId'
 *       courseCode:
 *         $ref: '#/definitions/CourseCode'
 *       department:
 *         $ref: '#/definitions/LocalizedString'
 *       name:
 *         $ref: '#/definitions/LocalizedString'
 *       evaluationInformation:
 *         $ref: '#/definitions/LocalizedString'
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
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/definitions/CourseData'
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
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/CourseData'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses',
  authorization,
  controllerDispatcher(getAllCourses)
);

/**
 * @swagger
 * /v1/courses:
 *   post:
 *     tags: [Course]
 *     description: Create a new course.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 $ref: '#/definitions/CourseCode'
 *               department:
 *                 $ref: '#/definitions/LocalizedString'
 *               name:
 *                 $ref: '#/definitions/LocalizedString'
 *     responses:
 *       200:
 *         description: The course was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           $ref: '#/definitions/CourseId'
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
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses',
  passport.authenticate('jwt', { session: false }),
  authorization([UserRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addCourse)
);
