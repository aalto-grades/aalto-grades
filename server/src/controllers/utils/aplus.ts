// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosResponse} from 'axios';
import {Request} from 'express';
import {z} from 'zod';

import {HttpCode} from '@/common/types';
import {AXIOS_TIMEOUT} from '../../configs/constants';
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
  return await axios.get<T>(url, {
    timeout: AXIOS_TIMEOUT,
    validateStatus: (status: number) => status === 200,
    headers: {Authorization: `Token ${aplusToken}`},
  });
};
