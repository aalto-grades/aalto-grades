// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import {z} from 'zod';

import {
  type SisuCourseInstance,
  SisuCourseInstanceSchema,
} from '@/common/types';
import axios from './axios';

export const useSearchSisuCourses = (
  courseCode: string,
  options?: Partial<UseQueryOptions<SisuCourseInstance[]>>
): UseQueryResult<SisuCourseInstance[]> =>
  useQuery({
    queryKey: ['sisu-instances', courseCode],
    queryFn: async () =>
      z
        .array(SisuCourseInstanceSchema)
        .parse((await axios.get(`/api/v1/sisu/courses/${courseCode}`)).data),
    ...options,
  });
