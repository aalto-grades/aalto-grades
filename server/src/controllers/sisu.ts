// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {
  type SisuCourseInstance,
  SisuCourseInstanceSchema,
} from '@/common/types';
import type {Endpoint} from '../types';
import {fetchFromSisu, validateSisuCourseCode} from './utils/sisu';
import {SISU_TOKEN_PROVIDED} from '../configs/environment';
import {apiMockData} from '../configs/sisu';

/**
 * () => SisuCourseInstance[]
 *
 * @throws ApiError(404|502)
 */
export const fetchSisuCoursesByCode: Endpoint<
  void,
  SisuCourseInstance[]
> = async (req, res) => {
  const courseCode = validateSisuCourseCode(req.params.courseCode);

  if (!SISU_TOKEN_PROVIDED) {
    res.json(apiMockData);
    return;
  }

  const response = await fetchFromSisu(
    'courseunitrealisations',
    {courseCode},
    z.array(SisuCourseInstanceSchema)
  );

  res.json(response);
};
