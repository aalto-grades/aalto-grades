// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AxiosResponse} from 'axios';
import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusExerciseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  NewAplusGradeSourceArraySchema,
} from '@common/types';
import AplusGradeSource from '../database/models/aplusGradeSource';
import AttainmentGrade from '../database/models/attainmentGrade';
import User from '../database/models/user';
import {ApiError, AttainmentGradeModelData, JwtClaims} from '../types';
import {fetchFromAplus, validateAplusCourseId} from './utils/aplus';
import {validateAttainmentPath} from './utils/attainment';
import {validateCourseId} from './utils/course';

const APLUS_URL = 'https://plus.cs.aalto.fi/api/v2';

/**
 * Responds with AplusExerciseData
 *
 * @throws ApiError(400)
 */
export const fetchAplusExerciseData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const aplusCourseId = validateAplusCourseId(req.params.aplusCourseId);

  const exercisesRes: AxiosResponse<{
    results: {
      id: number;
      display_name: string;
      exercises: {
        difficulty: string;
      }[];
    }[];
  }> = await fetchFromAplus(
    `${APLUS_URL}/courses/${aplusCourseId}/exercises?format=json`
  );

  // TODO: Is there an easier way to get difficulties?
  const difficulties = new Set<string>();
  for (const result of exercisesRes.data.results) {
    for (const exercise of result.exercises) {
      if (exercise.difficulty) {
        difficulties.add(exercise.difficulty);
      }
    }
  }

  const exerciseData: AplusExerciseData = {
    modules: exercisesRes.data.results.map(result => {
      return {
        id: result.id,
        name: result.display_name,
      };
    }),
    difficulties: Array.from(difficulties),
  };

  res.json(exerciseData);
};

/** @throws ApiError(400|404) */
export const addAplusGradeSources = async (
  req: TypedRequestBody<typeof NewAplusGradeSourceArraySchema>,
  res: Response
): Promise<void> => {
  await validateCourseId(req.params.courseId);

  const preparedBulkCreate: AplusGradeSourceData[] = req.body;
  await AplusGradeSource.bulkCreate(preparedBulkCreate);

  res.sendStatus(HttpCode.Created);
};

// TODO: What exactly should be fetched at a time?
/** @throws ApiError(400|404|409|422) */
export const fetchAplusGrades = async (
  req: Request,
  res: Response
): Promise<void> => {
  const grader = req.user as JwtClaims;
  const [_, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  // TODO: There can be multiple sources
  const gradeSource = await AplusGradeSource.findOne({
    where: {attainmentId: attainment.id},
  });

  if (!gradeSource) {
    throw new ApiError(
      `attainment with ID ${attainment.id} has no A+ grade sources`,
      HttpCode.UnprocessableEntity
    );
  }

  const allPointsRes: AxiosResponse<{
    results: {
      points: string;
    }[];
  }> = await fetchFromAplus(
    `${APLUS_URL}/courses/${gradeSource.aplusCourseId}/points?format=json`
  );

  const studentNumberToId: {[key: string]: number} = {};
  const nonexistentStudents: string[] = [];

  const gradesWithStudentNumber: (Omit<AttainmentGradeModelData, 'userId'> & {
    studentNumber: string;
  })[] = [];

  for (const result of allPointsRes.data.results) {
    // TODO: Fetching points individually for each student may not be the best idea
    const pointsRes: AxiosResponse<{
      student_id: string;
      points: number;
      points_by_difficulty: {
        [key: string]: number;
      };
      modules: {
        id: number;
        points: number;
      }[];
    }> = await fetchFromAplus(result.points);

    const user = await User.findOne({
      where: {studentNumber: pointsRes.data.student_id},
    });

    if (user) {
      // User was found using their student number
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      studentNumberToId[user.studentNumber!] = user.id;
    } else {
      nonexistentStudents.push(pointsRes.data.student_id);
    }

    let grade: number | undefined;
    switch (gradeSource.sourceType) {
      case AplusGradeSourceType.FullPoints:
        grade = pointsRes.data.points;
        break;

      case AplusGradeSourceType.Module:
        if (!gradeSource.moduleId) {
          throw new ApiError(
            `grade source with ID ${gradeSource.id} has module type but does not define moduleId`,
            HttpCode.InternalServerError
          );
        }
        for (const module of pointsRes.data.modules) {
          if (module.id === gradeSource.moduleId) {
            grade = module.points;
          }
        }
        if (!grade) {
          throw new ApiError(
            `A+ course with ID ${gradeSource.aplusCourseId} has no module with ID ${gradeSource.moduleId}`,
            HttpCode.InternalServerError
          );
        }
        break;

      case AplusGradeSourceType.Difficulty:
        if (!gradeSource.difficulty) {
          throw new ApiError(
            `grade source with ID ${gradeSource.id} has difficulty type but does not define difficulty`,
            HttpCode.InternalServerError
          );
        }
        if (!(gradeSource.difficulty in pointsRes.data.points_by_difficulty)) {
          throw new ApiError(
            `A+ course with ID ${gradeSource.aplusCourseId} has no difficulty ${gradeSource.difficulty}`,
            HttpCode.InternalServerError
          );
        }
        grade = pointsRes.data.points_by_difficulty[gradeSource.difficulty];
        break;
    }

    gradesWithStudentNumber.push({
      studentNumber: pointsRes.data.student_id,
      attainmentId: attainment.id,
      graderId: grader.id,
      date: new Date(), // TODO: Which date?
      expiryDate: new Date(), // TODO: date + daysValid by default, manually set?
      grade: grade,
    });
  }

  const newUsers = await User.bulkCreate(
    nonexistentStudents.map(val => ({studentNumber: val}))
  );

  for (const newUser of newUsers) {
    // User was just created with a student number
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    studentNumberToId[newUser.studentNumber!] = newUser.id;
  }

  const preparedBulkCreate: AttainmentGradeModelData[] =
    gradesWithStudentNumber.map(val => ({
      userId: studentNumberToId[val.studentNumber],
      attainmentId: val.attainmentId,
      graderId: val.graderId,
      date: val.date,
      expiryDate: val.expiryDate,
      grade: val.grade,
    }));

  await AttainmentGrade.bulkCreate(preparedBulkCreate);

  res.sendStatus(HttpCode.Created);
};
