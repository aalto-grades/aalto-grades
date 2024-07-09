// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
import {AxiosRequestConfig} from 'axios';

import {
  AplusCourseData,
  AplusCourseDataArraySchema,
  AplusExerciseData,
  AplusExerciseDataSchema,
  AplusGradeSourceData,
  NewGrade,
  NewGradeArraySchema,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';
import {getAplusToken} from '../../utils/utils';

const getHeaders = (): AxiosRequestConfig => ({
  headers: {
    Authorization: `Aplus-Token ${getAplusToken()}`,
  },
});

export const useFetchAplusCourses = (
  options?: Partial<UseQueryOptions<AplusCourseData[]>>
): UseQueryResult<AplusCourseData[]> =>
  useQuery({
    queryKey: ['a+-courses'],
    queryFn: async () =>
      AplusCourseDataArraySchema.parse(
        (await axios.get('/v1/aplus/courses', getHeaders())).data
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
        (await axios.get(`/v1/aplus/courses/${aplusCourseId}`, getHeaders()))
          .data
      ),
    ...options,
  });

export const useAddAplusGradeSources = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, AplusGradeSourceData[]>
): UseMutationResult<void, unknown, AplusGradeSourceData[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeSources: AplusGradeSourceData[]) =>
      axios.post(`/v1/courses/${courseId}/aplus-sources`, gradeSources),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      }),

    ...options,
  });
};

export const useDeleteAplusGradeSource = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, Numeric>
): UseMutationResult<unknown, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aplusGradeSourceId: Numeric) =>
      axios.delete(
        `/v1/courses/${courseId}/aplus-sources/${aplusGradeSourceId}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};

export const useFetchAplusGrades = (
  courseId: Numeric,
  coursePartIds: number[],
  options?: Partial<UseQueryOptions<NewGrade[]>>
): UseQueryResult<NewGrade[]> =>
  useQuery({
    queryKey: ['a+-grades', courseId],
    queryFn: async () =>
      NewGradeArraySchema.parse(
        (
          await axios.get(
            `/v1/courses/${courseId}/aplus-fetch?course-parts=${JSON.stringify(
              coursePartIds
            )}`,
            getHeaders()
          )
        ).data
      ),
    ...options,
  });
