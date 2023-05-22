// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';
import path from 'path';

import { addGrades } from '../controllers/grades';
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
  upload.single('csv_data'),
  controllerDispatcher(addGrades)
);
