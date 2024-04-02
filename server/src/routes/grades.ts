// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Request, Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import multer, {FileFilterCallback, Multer, memoryStorage} from 'multer';
import passport from 'passport';
import path from 'path';
import {processRequestBody} from 'zod-express-middleware';

import {HttpCode} from '@common/types';
import {
  SisuCSVSchema,
  addGrades,
  editUserGrade,
  getCsvTemplate,
  getGradeTreeOfAllUsers,
  getGradeTreeOfUser,
  getGrades,
  getSisuFormattedGradingCSV,
} from '../controllers/grades';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';
import {ApiError} from '../types';

export const router = Router();

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
    fileSize: 1048576,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) => {
    const ext: string = path.extname(file.originalname).toLowerCase();
    if (file.mimetype == 'text/csv' && ext === '.csv') {
      callback(null, true);
    } else {
      callback(
        new ApiError(
          'incorrect file format, use the CSV format',
          HttpCode.BadRequest
        )
      );
    }
  },
});

router.get(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getGrades)
);

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getCsvTemplate)
);

// Actually gets the csv but the requirest type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/grades/csv/sisu',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCSVSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);

// router.get(
//   '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
//   passport.authenticate('jwt', {session: false}),
//   controllerDispatcher(getFinalGrades)
// );

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/fullTree',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getGradeTreeOfAllUsers)
);

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/user/:userId',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getGradeTreeOfUser)
);

// router.post(
//   '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
//   passport.authenticate('jwt', {session: false}),
//   upload.single('csv_data'),
//   controllerDispatcher(addGrades)
// );

router.post(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}),
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  controllerDispatcher(addGrades)
);

// router.post(
//   '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
//   passport.authenticate('jwt', {session: false}),
//   express.json(),
//   handleInvalidRequestJson
//   // controllerDispatcher(calculateGrades)
// );

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(editUserGrade)
);
