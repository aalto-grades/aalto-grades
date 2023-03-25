// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Router } from 'express';
import multer, { FileFilterCallback, memoryStorage, Multer } from 'multer';

import { addGrades } from '../controllers/grades';

import { controllerDispatcher } from '../middleware/errorHandler';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

export const router: Router = Router();

/**
 * Multer middleware configuration for handling CSV file uploads. This configuration sets up
 * multer to use memory storage, allowing for temporary storage of uploaded files in memory.
 * It also sets a file size limit of 1 MB and enforces that the uploaded file is in the CSV
 * format by checking the files mimetype.
 */
const upload: Multer = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 1048576
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (file.mimetype == 'text/csv') {
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
