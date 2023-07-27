// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from 'aalto-grades-common/types';
import express, { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';
import passport from 'passport';
import path from 'path';

import {
  addGrades, calculateGrades, getCsvTemplate,
  getFinalGrades, getSisuFormattedGradingCSV, getUserAttainmentModelGrades
} from '../controllers/grades';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';
import { ApiError } from '../types';

export const router: Router = Router();

/**
 * Multer middleware configuration for handling CSV file uploads.
 * This configuration sets up multer to use memory storage, allowing for
 * temporary storage of uploaded files in memory. It also sets a file size
 * limit of 1 MB and enforces that the uploaded file is in the CSV format by
 * checking the files mimetype and file extension type.
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
 *           If grade is not yet calculated, grade will be 'PENDING'
 *         example: PASS
 *       credits:
 *         type: integer
 *         description: How many course credits (ECTS) student receives from course.
 *         format: int32
 *         minimum: 0
 *         example: 5
 *   AssessmentModelGradingData:
 *     type: object
 *     description: Students grading data for assessment model.
 *     properties:
 *       attainmentId:
 *         $ref: '#/definitions/AttainmentId'
 *       gradeId:
 *         type: integer
 *         description: Internal attainment grade database ID.
 *         format: int32
 *         minimum: 0
 *         example: 5
 *       tag:
 *         $ref: '#/definitions/AttainmentTag'
 *       name:
 *         $ref: '#/definitions/AttainmentName'
 *       grade:
 *         type: number
 *         description: User attainment grade.
 *         format: int32
 *         minimum: 0
 *         example: 5
 */

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades/csv:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Returns a template CSV file for a particular assessment model for
 *       uploading grades. Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *     responses:
 *       200:
 *         description: Template generated succesfully.
 *         content:
 *           text/csv:
 *             description: CSV template for uploading grades.
 *             schema:
 *               type: string
 *             example: |
 *               StudentNumber,exam,exercises,project
 *       400:
 *         description: Fetching failed, due to validation errors in parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           The given course or assessment model does not exist, or the
 *           assessment model has no attainments.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCsvTemplate)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades/csv/sisu:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Get the final grades of all students in a Sisu compatible CSV format.
 *       Results can be filtered by student numbers or particular instance ID.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/studentNumbers'
 *       - $ref: '#/components/parameters/instanceIdQuery'
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
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           The given course or assessment model does not exist
 *           or no course results found for the instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv/sisu',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getSisuFormattedGradingCSV)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Get the final grades of all students.
 *       Results can be filtered by student numbers or particular instance ID.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/studentNumbers'
 *       - $ref: '#/components/parameters/instanceIdQuery'
 *     responses:
 *       200:
 *         description: Grades fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/GradingData'
 *       400:
 *         description: Fetching failed, due to validation errors in parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           The given course or assessment model does not exist
 *           or no course results found for the instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getFinalGrades)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades/user/{userId}:
 *   get:
 *     tags: [Grades]
 *     description: >
 *       Get all attainment grades for assessment model, using user ID.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: User grades fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/AssessmentModelGradingData'
 *       400:
 *         description: Fetching failed, due to validation errors in parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           The given course or assessment model does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/user/:userId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getUserAttainmentModelGrades)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades/csv:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Add attainment grades for users in a particular assessment model.
 *       Attainment grading data is provided in a CSV file. When sending data,
 *       set the **Content-Type** header as **multipart/form-data** and the
 *       file name as "csv_data". Example CSV files available
 *       [here](https://github.com/aalto-grades/base-repository/tree/main/server/test/mock-data/csv)
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
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
 *         description: >
 *           A course or assessment model with the given ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Assessment model does not belong to the course or attainment does
 *           not belong to the assessment model. User with course role
 *           'TEACHER' or 'TEACHER_IN_CHARGE' listed in the grading data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: >
 *           At least one of the attainments listed in the CSV file was not
 *           found with the given ID or does not belong to the assessment model
 *           to which the grading data is being imported.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
  passport.authenticate('jwt', { session: false }),
  upload.single('csv_data'),
  controllerDispatcher(addGrades)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/grades/calculate:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Calculate the final grades of all students.
 *       Calculation can be executed to particular set of student numbers or particular instance ID.
 *       At least one of these must be provided.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentNumbers:
 *                 type: array
 *                 required: false
 *                 description: List of students to include in the calculation.
 *                 example: ['111111', '222222', '333333']
 *                 items:
 *                   type: string
 *               instanceId:
 *                 type: number
 *                 required: false
 *                 description: Instance ID to which students the calculation is executed.
 *                 example: 8
 *     responses:
 *       200:
 *         description: Grades calculated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   description: Empty data object.
 *                   type: object
 *       400:
 *         description: >
 *           Calculation failed, due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: The given course or assessment model does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(calculateGrades)
);
