// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosResponse} from 'axios';
import {Request} from 'express';
import {z} from 'zod';

import {AplusGradeSourceData, HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import {findCoursePartById} from './coursePart';
import {AXIOS_TIMEOUT} from '../../configs/constants';
import httpLogger from '../../configs/winston';
import AplusGradeSource from '../../database/models/aplusGradeSource';
import Course from '../../database/models/course';
import {ApiError, stringToIdSchema} from '../../types';

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
  return await findAplusGradeSourceById(result.data);
};

/**
 * Finds a course and A+ grade source by URL param IDs and validates the IDs.
 *
 * @throws ApiError(400|404|409) if invalid, not found, or the A+ grade source
 *   does nto belong to the course.
 */
export const validateAplusGradeSourcePath = async (
  courseId: string,
  aplusGradeSourceId: string
): Promise<[Course, AplusGradeSource]> => {
  const course = await findAndValidateCourseId(courseId);
  const aplusGradeSource =
    await findAndValidateAplusGradeSourceId(aplusGradeSourceId);
  const coursePart = await findCoursePartById(aplusGradeSource.courseTaskId);

  if (coursePart.courseId !== course.id) {
    throw new ApiError(
      `A+ grade source with ID ${aplusGradeSource.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, aplusGradeSource];
};

/**
 * Validates that an A+ grade source exists and belongs to a course part.
 *
 * @throws ApiError(404|409) if A+ grade source is not found or doesn't belong
 *   to the course part.
 */
export const validateAplusGradeSourceBelongsToCoursePart = async (
  coursePartId: number,
  aplusGradeSourceId: number
): Promise<void> => {
  const aplusGradeSource = await findAplusGradeSourceById(aplusGradeSourceId);
  if (aplusGradeSource.courseTaskId !== coursePartId) {
    throw new ApiError(
      `A+ grade source with ID ${aplusGradeSource.id} ` +
        `does not  belong to the course part with ID ${coursePartId}`,
      HttpCode.Conflict
    );
  }
};

export const parseAplusGradeSource = (
  aplusGradeSource: AplusGradeSource
): AplusGradeSourceData =>
  ({
    id: aplusGradeSource.id,
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
  aplusToken: string
): Promise<AxiosResponse<T>> => {
  httpLogger.http(`Calling A+ With "GET ${url}"`);
  return await axios.get<T>(url, {
    timeout: AXIOS_TIMEOUT,
    validateStatus: (status: number) => status === 200,
    headers: {Authorization: `Token ${aplusToken}`},
  });
};
