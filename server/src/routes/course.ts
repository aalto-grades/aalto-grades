// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';

import { addCourse, addGrades, getCourse } from '../controllers/course';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

export const router: Router = Router();

const upload: Multer = multer({
  storage: memoryStorage(),   // Store csv temporarily on the memory.
  limits: {
    fileSize: 1024 * 1024     // The max file size (in bytes), limit to 1 MB.
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (file.mimetype == 'text/csv') {
      callback(null, true);
    } else {
      return callback(new ApiError('incorrect file format, use csv format', HttpCode.BadRequest));
    }
  }
});

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

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/csv:
 *   post:
 *     tags: [Course]
 *     description: Add attainment points for users for specific course instance.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *     responses:
 *       200:
 *         description: Grading csv uploaded and parsed succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *       400:
 *         description: A validation or parsing error with the csv has occurred.
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
 *         description: >
 *           The requester is not authorized to add grading data
 *           to the course instance (not teacher in the course).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: Course, course instance, or any of the attainable does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Course instance does not belong to the course or
 *           study attainment does not belong to the course instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/grades/csv',
  upload.single('csv_data'),
  controllerDispatcher(addGrades)
);
