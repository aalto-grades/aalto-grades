// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type SisuCourseInstance,
  SisuCourseInstanceArraySchema,
} from '@/common/types';
import type {Endpoint} from '../types';
import {fetchFromSisu, validateSisuCourseCode} from './utils/sisu';
import {ENABLE_SISU_MOCKS} from '../configs/environment';
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
  const code = validateSisuCourseCode(req.params.courseCode);

  if (ENABLE_SISU_MOCKS) {
    res.json(apiMockData);
    return;
  }

  const response = await fetchFromSisu(
    'courseunitrealisations',
    {code},
    SisuCourseInstanceArraySchema
  );

  res.json(response);
};
