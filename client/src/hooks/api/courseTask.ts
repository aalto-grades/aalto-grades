// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  CourseTaskData,
  CourseTaskDataArraySchema,
  ModifyCourseTasks,
} from '@/common/types';
import {Numeric} from '@/types';
import axios from './axios';

export const useGetCourseTasks = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CourseTaskData[]>>
): UseQueryResult<CourseTaskData[]> =>
  useQuery({
    queryKey: ['course-tasks', courseId],
    queryFn: async () =>
      CourseTaskDataArraySchema.parse(
        (await axios.get(`/api/v1/courses/${courseId}/tasks`)).data
      ),
    ...options,
  });

export const useModifyCourseTasks = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, ModifyCourseTasks>
): UseMutationResult<void, unknown, ModifyCourseTasks> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async modifications =>
      await axios.post(`/api/v1/courses/${courseId}/tasks`, modifications),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};
