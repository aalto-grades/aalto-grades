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
import {getToken} from '@/utils';

export const useSearchSisuCourses = (
  courseCode: string,
  options?: Partial<UseQueryOptions<SisuCourseInstance[]>>
): UseQueryResult<SisuCourseInstance[]> =>
  useQuery({
    queryKey: ['sisu-instances', courseCode],
    queryFn: async () => {
      const instances = z.array(SisuCourseInstanceSchema);

      const url = `https://course.api.aalto.fi:443/api/sisu/v1/courseunitrealisations?code=${courseCode}&USER_KEY=${getToken('sisu')}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok, data not found');
      }

      const data = instances.parse(await response.json());
      return data;
    },
    ...options,
  });
