// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import { addCourse, getCourse } from '../controllers/course';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   LocalizedString:
 *     type: object
 *     description: >
 *       Object containing translations of a string in Finnish, Swedish, and
 *       English.
 *     properties:
 *       fi:
 *         type: string
 *         description: Finnish translation.
 *       sv:
 *         type: string
 *         description: Swedish translation.
 *       en:
 *         type: string
 *         description: English translation.
 *   CourseData:
 *     type: object
 *     description: Course information.
 *     properties:
 *       id:
 *         type: integer
 *         description: Internal course database ID.
 *       courseCode:
 *         type: string
 *         description: Course code, e.g. CS-A1110.
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
 *     description: Get information about a course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: True
 *         schema:
 *           type: integer
 *         description: The ID of the desired course.
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
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/definitions/CourseData'
 *       404:
 *         description: A course with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId',
  controllerDispatcher(getCourse)
);

/**
 * @swagger
 * /v1/courses:
 *   post:
 *     tags: [Course]
 *     description: Create a course.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *                 description: Course code, e.g. CS-A1110.
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
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the newly added course.
 *       400:
 *         description: A validation error has occurred in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         description: The requester is not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       403:
 *         description: The requester is not authorized to create a course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addCourse)
);
