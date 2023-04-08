// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';
import path from 'path';

import { addGrades, calculateGrades } from '../controllers/grades';
import { controllerDispatcher } from '../middleware/errorHandler';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

export const router: Router = Router();

/* @swagger
 * definitions:
 *   Grades:
 *     description: Calculated final grades for each student.
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         studentId:
 *           type: number
 *           description: Student database identifier.
 *         grade:
 *           type: number
 *           description: Final grade of the student.
 *         status:
 *           type: string
 *           description: >
 *             'pass' or 'fail' to indicate whether the attainment has been
 *              successfully completed.
 */

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
 * /v1/courses/{courseId}/instances/{instanceId}/grades/csv:
 *   post:
 *     tags: [Grades]
 *     description: Add attainment grades for users enrolled in a specific course instance.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *     responses:
 *       200:
 *         description: Grading CSV uploaded and parsed succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *       400:
 *         description: A validation or parsing error with the CSV has occurred.
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
 *         description: A course or course instance with the given ID was not found.
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
 *       422:
 *         description: >
 *           At least one of the attainments listed in the CSV file was not found with the given ID.
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

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/calculate:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Calculate and get the final grades of all students.
 *       [ANTI-BIKESHEDDING PLACEHOLDER]
 *     requestBody:
 *       description: The request body should be empty.
 *     responses:
 *       200:
 *         description: Grades calculated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Grades'
 *       400:
 *         description: >
 *           Calculation failed, due to validation errors or missing parameters.
 *           This may also indicate a cycle in the hierarchy of attainables.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: The given course or course instance does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/grades/calculate',
  controllerDispatcher(calculateGrades)
);
