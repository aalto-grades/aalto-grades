// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import axios from 'axios';
import {type ZodError, z} from 'zod';

import data from '@/common/mocks/sisu.json';
import {
  type SisuCourseInstance,
  SisuCourseInstanceSchema,
  type SisuError,
  SisuErrorSchema,
} from '@/common/types';
import {getToken} from '@/utils';

const axiosSisuInstance = axios.create({
  baseURL: 'https://course.api.aalto.fi:443/api/sisu/v1',
  validateStatus: (status: number) => status < 600 && status >= 100,
});

axiosSisuInstance.defaults.params = {USER_KEY: getToken('sisu')};

axiosSisuInstance.interceptors.response.use(response => {
  const resData = response.data as SisuError | {errors: ZodError}[] | null;

  // Zod error
  if (response.status === 400 && Array.isArray(resData)) {
    const resErrors = resData[0];
    throw new Error(
      `${response.status} - ${response.statusText}: ` +
        resErrors.errors.issues
          .map(issue => `'/${issue.path.join('/')} : ${issue.message}'`)
          .join(', ')
    );
  }

  // Sisu API error
  if (resData !== null && 'error' in resData) {
    const parsed = SisuErrorSchema.parse(resData);
    throw new Error(`${response.status} - Sisu error: ${parsed.error.message}`);
  }

  return response;
});

export const useSearchSisuCourses = (
  courseCode: string,
  options?: Partial<UseQueryOptions<SisuCourseInstance[]>>
): UseQueryResult<SisuCourseInstance[]> =>
  useQuery({
    queryKey: ['sisu-instances', courseCode],
    queryFn: async () => {
      if (
        import.meta.env.MODE === 'development' &&
        courseCode.startsWith('mock')
      ) {
        return z.array(SisuCourseInstanceSchema).parse(data);
      }

      return z.array(SisuCourseInstanceSchema).parse(
        (
          await axiosSisuInstance.get('/courseunitrealisations', {
            params: {code: courseCode},
          })
        ).data
      );
    },
    ...options,
  });
