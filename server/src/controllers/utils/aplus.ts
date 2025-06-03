// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import type {Request} from 'express';
import {type ZodSchema, z} from 'zod';

import {type AplusGradeSourceData, HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import {validateCourseTaskBelongsToCourse} from './courseTask';
import {AXIOS_TIMEOUT} from '../../configs/constants';
import httpLogger from '../../configs/winston';
import AplusGradeSource from '../../database/models/aplusGradeSource';
import type Course from '../../database/models/course';
import {
  ApiError,
  createAplusPaginationSchema,
  stringToIdSchema,
} from '../../types';

/**
 * Validates A+ course ID url param and returns it as a number.
 *
 * @throws ApiError(400) if invalid.
 */
export const validateAplusCourseId = (aplusCourseId: string): number => {
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
 * Finds an A+ grade source by ID.
 *
 * @throws ApiError(400) if not found.
 */
const findAplusGradeSourceById = async (
  aplusGradeSourceId: number
): Promise<AplusGradeSource> => {
  const aplusGradeSource = await AplusGradeSource.findByPk(aplusGradeSourceId);
  if (aplusGradeSource === null) {
    throw new ApiError(
      `A+ grade source with ID ${aplusGradeSourceId} not found`,
      HttpCode.NotFound
    );
  }
  return aplusGradeSource;
};

/**
 * Finds an A+ grade source by a URL param ID and validates the ID.
 *
 * @throws ApiError(400|404) if invalid or not found.
 */
const findAndValidateAplusGradeSourceId = async (
  aplusGradeSourceId: string
): Promise<AplusGradeSource> => {
  const result = stringToIdSchema.safeParse(aplusGradeSourceId);
  if (!result.success) {
    throw new ApiError(
      `Invalid A+ grade source ID ${aplusGradeSourceId}`,
      HttpCode.BadRequest
    );
  }
  return findAplusGradeSourceById(result.data);
};

/**
 * Finds a course and A+ grade source by URL param IDs and validates the IDs.
 *
 * @throws ApiError(400|404|409) if invalid, not found, or the A+ grade source
 *   does not belong to the course.
 */
export const validateAplusGradeSourcePath = async (
  courseId: string,
  aplusGradeSourceId: string
): Promise<[Course, AplusGradeSource]> => {
  const course = await findAndValidateCourseId(courseId);
  const aplusGradeSource =
    await findAndValidateAplusGradeSourceId(aplusGradeSourceId);

  await validateCourseTaskBelongsToCourse(
    course.id,
    aplusGradeSource.courseTaskId
  );

  return [course, aplusGradeSource];
};

/**
 * Validates that an A+ grade source exists and belongs to a course task.
 *
 * @throws ApiError(404|409) if A+ grade source is not found or doesn't belong
 *   to the course task.
 */
export const validateAplusGradeSourceBelongsToCourseTask = async (
  courseTaskId: number,
  aplusGradeSourceId: number
): Promise<void> => {
  const aplusGradeSource = await findAplusGradeSourceById(aplusGradeSourceId);
  if (aplusGradeSource.courseTaskId !== courseTaskId) {
    throw new ApiError(
      `A+ grade source with ID ${aplusGradeSource.id} ` +
        `does not belong to the course task with ID ${courseTaskId}`,
      HttpCode.Conflict
    );
  }
};

export const parseAplusGradeSource = (
  aplusGradeSource: AplusGradeSource
): AplusGradeSourceData =>
  ({
    id: aplusGradeSource.id,
    courseTaskId: aplusGradeSource.courseTaskId,
    aplusCourse: aplusGradeSource.aplusCourse,
    sourceType: aplusGradeSource.sourceType,
    moduleId: aplusGradeSource.moduleId ?? undefined,
    moduleName: aplusGradeSource.moduleName ?? undefined,
    exerciseId: aplusGradeSource.exerciseId ?? undefined,
    exerciseName: aplusGradeSource.exerciseName ?? undefined,
    difficulty: aplusGradeSource.difficulty ?? undefined,
    date: new Date(aplusGradeSource.date),
  }) as AplusGradeSourceData;

/**
 * Validates that an A+ API token was provided and parses it from the request
 * header.
 *
 * @throws ApiError(400)
 */
export const parseAplusToken = (req: Request): string => {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new ApiError('no A+ API token provided', HttpCode.BadRequest);
  }

  const authArray = auth.split(' ');
  const result = z
    .tuple([z.literal('Aplus-Token'), z.string().length(40)])
    .safeParse(authArray);
  if (!result.success) {
    throw new ApiError(result.error.message, HttpCode.BadRequest);
  }

  return authArray[1];
};

/**
 * Fetches data from A+ using the given URL.
 *
 * @throws AxiosError if fetching fails.
 */
export const fetchFromAplus = async <T>(
  url: string,
  aplusToken: string,
  schema: ZodSchema<T>
): Promise<T> => {
  httpLogger.http(`Calling A+ With "GET ${url}"`);

  const result = schema.safeParse(
    (
      await axios.get<T>(url, {
        timeout: AXIOS_TIMEOUT,
        validateStatus: (status: number) => status === 200,
        headers: {Authorization: `Token ${aplusToken}`},
      })
    ).data
  );

  if (!result.success) {
    throw new ApiError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Validating data from A+ failed: ${result.error}`,
      HttpCode.BadGateway
    );
  }

  return result.data;
};

/**
 * Fetches paginated data from A+ using the given URL.
 *
 * @throws AxiosError if fetching fails.
 */
export const fetchFromAplusPaginated = async <T extends readonly unknown[]>(
  url: string,
  aplusToken: string,
  schema: ZodSchema<T>
): Promise<T> => {
  httpLogger.http(`Calling A+ With "GET ${url}"`);

  const paginatedSchema = createAplusPaginationSchema(schema);
  const resultArray: T[number][] = [];
  let currentUrl: string | null = url;

  do {
    const response = await axios.get(currentUrl, {
      timeout: AXIOS_TIMEOUT,
      validateStatus: (status: number) => status === 200,
      headers: {Authorization: `Token ${aplusToken}`},
    });

    const result = paginatedSchema.safeParse(response.data);

    if (!result.success) {
      throw new ApiError(
        `Validating data from A+ failed: ${result.error.toString()}`,
        HttpCode.BadGateway
      );
    }

    // result.data.results is of type T (the full array), so we spread it
    resultArray.push(...(result.data.results as T));
    currentUrl = result.data.next;
  } while (currentUrl);

  return resultArray as unknown as T;
};
