// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import type {ZodSchema} from 'zod';

import {HttpCode, type SisuError, SisuErrorSchema} from '@/common/types';
import {AXIOS_TIMEOUT} from '../../configs/constants';
import {SISU_API_TOKEN, SISU_API_URL} from '../../configs/environment';
import httpLogger from '../../configs/winston';
import {ApiError, nonEmptyStringSchema} from '../../types';

/**
 * Fetches data from Sisu API using the given URL path and params.
 *
 * @throws AxiosError if fetching fails.
 */
export const fetchFromSisu = async <T>(
  path: string,
  params: Record<string, string>,
  schema: ZodSchema<T>
): Promise<T> => {
  const url = `${SISU_API_URL}/${path}`;
  httpLogger.http(`Calling Sisu With "GET ${url}"`);

  const data = (
    await axios.get<T | SisuError>(url, {
      timeout: AXIOS_TIMEOUT,
      validateStatus: (status: number) => {
        return status >= 200 && status < 500;
      },
      params: {...params, USER_KEY: SISU_API_TOKEN},
    })
  ).data;

  const parsed = SisuErrorSchema.safeParse(data);

  if (parsed.success) {
    throw new ApiError(
      `Sisu API error: ${parsed.data.error.message}`,
      HttpCode.NotFound
    );
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
       
      `Validating data from Sisu failed: ${result.error}`,
      HttpCode.BadGateway
    );
  }

  return result.data;
};

/**
 * Validates Sisu course code url param and returns it as string.
 *
 * @throws ApiError(400) if invalid.
 */
export const validateSisuCourseCode = (courseCode: unknown): string => {
  const result = nonEmptyStringSchema.safeParse(courseCode);
  if (!result.success) {
    throw new ApiError('Invalid Sisu course code', HttpCode.BadRequest);
  }
  return result.data;
};
