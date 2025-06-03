// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {AxiosRequestConfig} from 'axios';

import {
  type AplusCourseData,
  AplusCourseDataArraySchema,
  type AplusExerciseData,
  AplusExerciseDataSchema,
  type NewAplusGradeSourceData,
  type NewTaskGrade,
  NewTaskGradeArraySchema,
} from '@/common/types';
import type {Numeric} from '@/types';
import {getToken} from '@/utils';
import axios from './axios';

const getHeaders = (): AxiosRequestConfig => ({
  headers: {Authorization: `Aplus-Token ${getToken()}`},
});

export const useFetchAplusCourses = (
  options?: Partial<UseQueryOptions<AplusCourseData[]>>
): UseQueryResult<AplusCourseData[]> =>
  useQuery({
    queryKey: ['a+-courses'],
    queryFn: async () =>
      AplusCourseDataArraySchema.parse(
        (await axios.get('/api/v1/aplus/courses', getHeaders())).data
      ),
    ...options,
  });

export const useFetchAplusExerciseData = (
  aplusCourseId: Numeric,
  options?: Partial<UseQueryOptions<AplusExerciseData>>
): UseQueryResult<AplusExerciseData> =>
  useQuery({
    queryKey: ['a+-exercises', aplusCourseId],
    queryFn: async () =>
      AplusExerciseDataSchema.parse(
        (
          await axios.get(
            `/api/v1/aplus/courses/${aplusCourseId}`,
            getHeaders()
          )
        ).data
      ),
    ...options,
  });

export const useAddAplusGradeSources = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewAplusGradeSourceData[]>
): UseMutationResult<void, unknown, NewAplusGradeSourceData[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async gradeSources =>
      axios.post(`/api/v1/courses/${courseId}/aplus-sources`, gradeSources),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

export const useDeleteAplusGradeSource = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async aplusGradeSourceId =>
      axios.delete(
        `/api/v1/courses/${courseId}/aplus-sources/${aplusGradeSourceId}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

export const useFetchAplusGrades = (
  courseId: Numeric,
  courseTaskIds: number[],
  options?: Partial<UseQueryOptions<NewTaskGrade[]>>
): UseQueryResult<NewTaskGrade[]> =>
  useQuery({
    queryKey: ['a+-grades', courseId, courseTaskIds],
    queryFn: async () =>
      NewTaskGradeArraySchema.parse(
        (
          await axios.get(
            `/api/v1/courses/${courseId}/aplus-fetch?course-tasks=${JSON.stringify(
              courseTaskIds
            )}`,
            getHeaders()
          )
        ).data
      ),
    ...options,
  });
