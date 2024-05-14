// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {z} from 'zod';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusExerciseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  NewAplusGradeSourceArraySchema,
  NewGrade,
} from '@/common/types';
import {fetchFromAplus, validateAplusCourseId} from './utils/aplus';
import {validateAttainmentPath} from './utils/attainment';
import {validateCourseId} from './utils/course';
import AplusGradeSource from '../database/models/aplusGradeSource';
import {ApiError} from '../types';

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

  const exercisesRes = await fetchFromAplus<{
    results: {
      id: number;
      display_name: string;
      exercises: {
        difficulty: string;
      }[];
    }[];
  }>(`${APLUS_URL}/courses/${aplusCourseId}/exercises?format=json`);

  // There doesn't appear to be a better way to get difficulties
  const difficulties = new Set<string>();
  for (const result of exercisesRes.data.results) {
    for (const exercise of result.exercises) {
      if (exercise.difficulty) {
        difficulties.add(exercise.difficulty);
      }
    }
  }

  const exerciseData: AplusExerciseData = {
    modules: exercisesRes.data.results.map(result => ({
      id: result.id,
      name: result.display_name,
    })),
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

/** @throws ApiError(400|404|409|422) */
export const fetchAplusGrades = async (
  req: Request,
  res: Response
): Promise<void> => {
  const attainmentIds = z
    .array(z.number().int().positive())
    .parse(JSON.parse(String(req.query.attainments)));

  const newGradesFromAplus: NewGrade[] = [];
  for (const attainmentId of attainmentIds) {
    // TODO: Batch validation?
    const [_, attainment] = await validateAttainmentPath(
      req.params.courseId,
      String(attainmentId)
    );

    // TODO: Find all grade sources at once?
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

    // We cannot fetch the student list outside this loop because attainment
    // grade sources may point to different A+ courses
    const allPointsRes = await fetchFromAplus<{
      results: {
        points: string;
      }[];
    }>(`${APLUS_URL}/courses/${gradeSource.aplusCourseId}/points?format=json`);

    for (const result of allPointsRes.data.results) {
      // TODO: Fetching points individually for each student may not be the best idea
      // Related: https://github.com/apluslms/a-plus/issues/1360
      const pointsRes = await fetchFromAplus<{
        student_id: string;
        points: number;
        points_by_difficulty: {
          [key: string]: number;
        };
        modules: {
          id: number;
          points: number;
        }[];
      }>(result.points);

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
          if (
            !(gradeSource.difficulty in pointsRes.data.points_by_difficulty)
          ) {
            throw new ApiError(
              `A+ course with ID ${gradeSource.aplusCourseId} has no difficulty ${gradeSource.difficulty}`,
              HttpCode.InternalServerError
            );
          }
          grade = pointsRes.data.points_by_difficulty[gradeSource.difficulty];
          break;
      }

      // TODO: Proper dates
      // Related: https://github.com/apluslms/a-plus/issues/1361
      newGradesFromAplus.push({
        studentNumber: pointsRes.data.student_id,
        attainmentId: attainment.id,
        grade: grade,
        date: new Date(),
        expiryDate: new Date(), // TODO: date + daysValid by default
        comment: null,
      });
    }
  }

  res.json(newGradesFromAplus);
};
