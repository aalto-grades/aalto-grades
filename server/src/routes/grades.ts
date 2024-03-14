// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import express, {Request, Router} from 'express';
import multer, {FileFilterCallback, Multer, memoryStorage} from 'multer';
import passport from 'passport';
import path from 'path';

import {
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

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv/sisu',
  passport.authenticate('jwt', {session: false}),
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
