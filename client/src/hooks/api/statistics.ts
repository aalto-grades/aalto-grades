// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

import type {CourseStatistics, GlobalStatistics} from '@/common/types';
import axios from './axios';

export interface GlobalStatisticsParams {
  courseIds?: number[];
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  grouping?: 'CALENDAR' | 'ACADEMIC' | 'COURSE';
}

export const useGetGlobalStatistics = (
  params?: GlobalStatisticsParams,
  options?: Partial<UseQueryOptions<GlobalStatistics>>,
): UseQueryResult<GlobalStatistics> =>
  useQuery({
    queryKey: ['statistics', params],
    queryFn: async () => {
      const {courseIds, startDate, endDate, search, grouping} = params || {};
      const res = await axios.get<GlobalStatistics>('/api/v1/statistics', {
        params: {
          courseIds,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          search,
          grouping,
        },
      });
      return res.data;
    },
    ...options,
  });

type StatisticsParams = {
  startDate?: string;
  endDate?: string;
  gradingModelId?: string;
  coursePartId?: string;
  courseTaskId?: string;
};

export const useGetCourseStatistics = (
  courseId: string,
  searchParams?: StatisticsParams,
  options?: Partial<UseQueryOptions<CourseStatistics>>,
): UseQueryResult<CourseStatistics> =>
  useQuery({
    queryKey: ['course-statistics', courseId, searchParams],
    queryFn: async () => {
      const res = await axios.get<CourseStatistics>(
        `/api/v1/courses/${courseId}/statistics`,
        {params: searchParams},
      );
      return res.data;
    },
    ...options,
  });
