// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosResponse} from 'axios';
import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusAttainmentData,
  AplusExerciseData,
  HttpCode,
  NewAplusAttainmentArraySchema,
} from '@common/types';
import {AXIOS_TIMEOUT} from '../configs/constants';
import AplusAttainment from '../database/models/aplusAttainment';
import {ApiError, stringToIdSchema} from '../types';
import {validateCourseId} from './utils/course';

// TODO: Teacher must provide API token somehow
const APLUS_API_TOKEN: string = process.env.APLUS_API_TOKEN || '';
const APLUS_URL = 'https://plus.cs.aalto.fi';

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
  }> = await axios.get(
    `${APLUS_URL}/api/v2/courses/${aplusCourseId}/exercises?format=json`,
    {
      timeout: AXIOS_TIMEOUT,
      validateStatus: (status: number) => status === 200,
      headers: {Authorization: `Token ${APLUS_API_TOKEN}`},
    }
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

// TODO: Comment
export const addAplusGradeSources = async (
  req: TypedRequestBody<typeof NewAplusAttainmentArraySchema>,
  res: Response
): Promise<void> => {
  await validateCourseId(req.params.courseId);

  const preparedBulkCreate: AplusAttainmentData[] = req.body;
  await AplusAttainment.bulkCreate(preparedBulkCreate);

  res.sendStatus(HttpCode.Created);
};
