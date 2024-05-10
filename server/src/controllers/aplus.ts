// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosResponse} from 'axios';
import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusExerciseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  NewAplusGradeSourceArraySchema,
} from '@common/types';
import {AXIOS_TIMEOUT} from '../configs/constants';
import AplusGradeSource from '../database/models/aplusGradeSource';
import AttainmentGrade from '../database/models/attainmentGrade';
import User from '../database/models/user';
import {
  ApiError,
  AttainmentGradeModelData,
  JwtClaims,
  stringToIdSchema,
} from '../types';
import {validateCourseId} from './utils/course';

// TODO: Teacher must provide API token somehow
const APLUS_API_TOKEN: string = process.env.APLUS_API_TOKEN || '';
const APLUS_URL = 'https://plus.cs.aalto.fi/api/v2';

const validateAplusCourseId = (aplusCourseId: string): number => {
  const result = stringToIdSchema.safeParse(aplusCourseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid A+ course ID ${aplusCourseId}`,
      HttpCode.BadRequest
    );
  }
  return result.data;
};

const fetchFromAplus = async (url: string): Promise<AxiosResponse> => {
  return await axios.get(
    url,
    {
      timeout: AXIOS_TIMEOUT,
      validateStatus: (status: number) => status === 200,
      headers: {Authorization: `Token ${APLUS_API_TOKEN}`},
    }
  );
}

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

  const aplusRes: AxiosResponse<{
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
  for (const result of aplusRes.data.results) {
    for (const exercise of result.exercises) {
      if (exercise.difficulty) {
        difficulties.add(exercise.difficulty);
      }
    }
  }

  const exerciseData: AplusExerciseData = {
    modules: aplusRes.data.results.map(result => {
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

// WIP
// TODO: What exactly should be fetched at a time?
export const fetchAplusGrades = async (
  req: Request,
  res: Response
): Promise<void> => {
  const grader = req.user as JwtClaims;
  const attainmentId = Number(req.params.attainmentId);

  // TODO: There can be multiple sources
  const gradeSource = await AplusGradeSource.findOne({where: {attainmentId}});
  if (!gradeSource) {
    throw new ApiError(
      `attainment with ID ${attainmentId} has no A+ grade sources`,
      HttpCode.UnprocessableEntity
    );
  }

  const aplusRes: AxiosResponse<{
    results: {
      points: string
    }[];
  }> = await fetchFromAplus(
    `${APLUS_URL}/courses/${gradeSource.aplusCourseId}/points?format=json`
  );

  const preparedBulkCreate: AttainmentGradeModelData[] = []
  for (const result of aplusRes.data.results) {
    // TODO: Fetching points individually for each student may not be the best idea
    const pointsRes: AxiosResponse<{
      student_id: string,
      points: number,
      points_by_difficulty: {
        [key: string]: number
      },
      modules: {
        id: number,
        points: number
      }[]
    }> = await fetchFromAplus(result.points);

    // TODO: Bulk create all users
    let user = await User.findOne({
      where: {studentNumber: pointsRes.data.student_id}
    });

    if (!user) {
      user = await User.create({studentNumber: pointsRes.data.student_id});
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
            HttpCode.InternalServerError,
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
            HttpCode.InternalServerError,
          );
        }
        break;

      case AplusGradeSourceType.Difficulty:
        if (!gradeSource.difficulty) {
          throw new ApiError(
            `grade source with ID ${gradeSource.id} has difficulty type but does not define difficulty`,
            HttpCode.InternalServerError,
          );
        }
        if (!(gradeSource.difficulty in pointsRes.data.points_by_difficulty)) {
          throw new ApiError(
            `A+ course with ID ${gradeSource.aplusCourseId} has no difficulty ${gradeSource.difficulty}`,
            HttpCode.InternalServerError,
          )
        }
        grade = pointsRes.data.points_by_difficulty[gradeSource.difficulty];
        break;
    }

    preparedBulkCreate.push({
      userId: user.id,
      attainmentId: attainmentId,
      graderId: grader.id,
      date: new Date(), // TODO: Which date?
      expiryDate: new Date(), // TODO: date + daysValid by default, manually set?
      grade: grade,
    });
  }

  await AttainmentGrade.bulkCreate(preparedBulkCreate);

  res.sendStatus(HttpCode.Created);
};
