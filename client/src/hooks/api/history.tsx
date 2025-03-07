// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

import {
  type TaskGradeHistoryArray,
  TaskGradeHistoryArraySchema,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetGradesHistory = (
  courseTaskId?: Numeric,
  userId?: string,
  options?: Partial<UseQueryOptions<TaskGradeHistoryArray>>
): UseQueryResult<TaskGradeHistoryArray> =>
  useQuery({
    queryKey: ['grades-history', userId, courseTaskId],
    queryFn: async () =>
      TaskGradeHistoryArraySchema.parse(
        (await axios.get(`/api/v1/grade-logs?courseTaskIds=${courseTaskId}`))
          .data
      ),
    ...options,
  });
