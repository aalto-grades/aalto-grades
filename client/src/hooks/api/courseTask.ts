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
  EditCourseTaskData,
  IdSchema,
  NewCourseTaskData,
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

export const useAddCourseTask = (
  courseId: Numeric,
  options?: UseMutationOptions<number, unknown, NewCourseTaskData>
): UseMutationResult<number, unknown, NewCourseTaskData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async courseTask =>
      IdSchema.parse(
        (await axios.post(`/api/v1/courses/${courseId}/tasks`, courseTask)).data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

type EditCourseTaskVars = {
  courseTaskId: Numeric;
  courseTask: EditCourseTaskData;
};
export const useEditCourseTask = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, EditCourseTaskVars>
): UseMutationResult<void, unknown, EditCourseTaskVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vars =>
      axios.put(
        `/api/v1/courses/${courseId}/tasks/${vars.courseTaskId}`,
        vars.courseTask
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};

export const useDeleteCourseTask = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseTaskId =>
      axios.delete(`/api/v1/courses/${courseId}/tasks/${courseTaskId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};
