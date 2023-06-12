// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';
import passport from 'passport';
import path from 'path';

import {
  addGrades, calculateGrades, getFinalGrades, getSisuFormattedGradingCSV
} from '../controllers/grades';
import { controllerDispatcher } from '../middleware/errorHandler';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

export const router: Router = Router();

/**
 * Multer middleware configuration for handling CSV file uploads. This configuration sets up
 * multer to use memory storage, allowing for temporary storage of uploaded files in memory.
 * It also sets a file size limit of 1 MB and enforces that the uploaded file is in the CSV
 * format by checking the files mimetype and file extension type.
 */
const upload: Multer = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 1048576
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    const ext: string = path.extname(file.originalname).toLowerCase();
    if (file.mimetype == 'text/csv' && ext === '.csv') {
      callback(null, true);
    } else {
      callback(new ApiError('incorrect file format, use the CSV format', HttpCode.BadRequest));
    }
  }
});

/**
 * @swagger
 * definitions:
 *   GradingData:
 *     type: object
 *     description: Students final grade data.
 *     properties:
 *       id:
 *         type: integer
 *         description: Student final grade database ID.
 *         format: int32
 *         minimum: 1
 *         example: 1
 *       studentNumber:
 *         $ref: '#/definitions/StudentNumber'
 *       grade:
 *         type: string
 *         description: >
 *           Final grade for the student. Either numeric (0, 1, 2, 3, 4, 5) or PASS/FAIL scale.
 *         example: PASS
 *       credits:
 *         type: integer
 *         description: How many course credits (ECTS) student receives from course.
 *         format: int32
 *         minimum: 0
 *         example: 5
 */

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/csv:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Add attainment grades for users enrolled in a specific course instance. Attainment grading
 *       data is provided in CSV file. When sending data set **Content-Type** header as
 *       **multipart/form-data** and file name as "csv_data". Example csv files available
 *       [here](https://github.com/aalto-grades/base-repository/tree/main/server/test/mockData/csv)
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csv_data:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Grading CSV uploaded and parsed succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   description: Empty data object.
 *                   type: object
 *       400:
 *         description: A validation or parsing error with the CSV has occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         description: >
 *           The requester is not authorized to add grading data
 *           to the course instance (not teacher in the course).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: A course or course instance with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Course instance does not belong to the course or
 *           study attainment does not belong to the course instance.
 *           User with course role 'TEACHER' or 'TEACHER_IN_CHARGE' listed in the grading data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: >
 *           At least one of the attainments listed in the CSV file was not found with the given ID
 *           or does not belong to the course instance to which the grading data is being imported.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/grades/csv',
  passport.authenticate('jwt', { session: false }),
  upload.single('csv_data'),
  controllerDispatcher(addGrades)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/calculate:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Calculate the final grades of all students.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the course.
 *       - in: path
 *         name: instanceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the course instance.
 *     requestBody:
 *       description: The request body should be empty.
 *     responses:
 *       200:
 *         description: Grades calculated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   description: Empty data object.
 *                   type: object
 *       400:
 *         description: >
 *           Calculation failed, due to validation errors or missing parameters.
 *           This may also indicate a cycle in the hierarchy of attainments.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: The given course or course instance does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given course instance does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/grades/calculate',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(calculateGrades)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/csv/sisu:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Get the final grades of all students in a Sisu compatible CSV format.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *       - in: query
 *         name: assessmentDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: >
 *           Assessment date marked on the grade CSV.
 *           Defaults to end date of the course instance.
 *         example: 2022-9-22
 *       - in: query
 *         name: completionLanguage
 *         schema:
 *           type: string
 *           enum: [fi, sv, en, es, ja, zh, pt, fr, de, ru]
 *         required: false
 *         description: Completion language marked on the grade CSV. Defaults to en.
 *         example: en
 *     responses:
 *       200:
 *         description: Grades calculated successfully.
 *         content:
 *           text/csv:
 *             description: CSV file with course results.
 *             schema:
 *               type: string
 *             example: |
 *               studentNumber,grade,credits,assessmentDate,completionLanguage
 *               352772,5,5,26.5.2023,fi
 *               812472,4,5,26.5.2023,fi
 *               545761,5,5,26.5.2023,fi
 *               662292,2,5,26.5.2023,fi
 *       400:
 *         description: Fetching failed, due to validation errors in the query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: >
 *           The given course or course instance does not exist
 *           or no course results found for the instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given course instance does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/instances/:instanceId/grades/csv/sisu',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getSisuFormattedGradingCSV)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Get the final grades of all students.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *     responses:
 *       200:
 *         description: Grades fetched successfully.
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
 *                     finalGrades:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/GradingData'
 *       400:
 *         description: Fetching failed, due to validation errors in parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: >
 *           The given course or course instance does not exist
 *           or no course results found for the instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given course instance does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/instances/:instanceId/grades',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getFinalGrades)
);
