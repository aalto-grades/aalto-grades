// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosResponse} from 'axios';

import {HttpCode} from '@common/types';
import {AXIOS_TIMEOUT} from '../../configs/constants';
import {ApiError, stringToIdSchema} from '../../types';

// TODO: Teacher must provide API token somehow
const APLUS_API_TOKEN: string = process.env.APLUS_API_TOKEN || '';

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
 * Fetches data from A+ using the given URL.
 *
 * @throws AxiosError if fetching fails.
 */
export const fetchFromAplus = async (
  url: string
): Promise<AxiosResponse<unknown>> => {
  return await axios.get(url, {
    timeout: AXIOS_TIMEOUT,
    validateStatus: (status: number) => status === 200,
    headers: {Authorization: `Token ${APLUS_API_TOKEN}`},
  });
};
