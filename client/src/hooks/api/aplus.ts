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

import {
  AplusCourseData,
  AplusCourseDataArraySchema,
  AplusExerciseData,
  AplusExerciseDataArraySchema,
  AplusGradeSourceData,
  NewGrade,
  NewGradeArraySchema,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useFetchAplusCourses = (
  options?: Partial<UseQueryOptions<AplusCourseData[]>>
): UseQueryResult<AplusCourseData[]> =>
  useQuery({
    queryKey: ['a+-courses'],
    queryFn: async () =>
      AplusCourseDataArraySchema.parse(
        (await axios.get('/v1/aplus/courses')).data
      ),
    ...options,
  });

export const useFetchAplusExerciseData = (
  aplusCourseId: Numeric,
  options?: Partial<UseQueryOptions<AplusExerciseData[]>>
): UseQueryResult<AplusExerciseData[]> =>
  useQuery({
    queryKey: ['a+-exercises', aplusCourseId],
    queryFn: async () =>
      AplusExerciseDataArraySchema.parse(
        (await axios.get(`/v1/aplus/courses/${aplusCourseId}`)).data
      ),
    ...options,
  });

export const useAddAplusGradeSources = (
  courseId: Numeric,
  options: UseMutationOptions<void, unknown, AplusGradeSourceData[]>
): UseMutationResult<void, unknown, AplusGradeSourceData[]> => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gradeSources: AplusGradeSourceData[]) =>
      await axios.post(`/v1/course/${courseId}/aplus-source`, gradeSources),
    ...options,
  });
};

export const useFetchAplusGrades = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<NewGrade[]>>
): UseQueryResult<NewGrade[]> =>
  useQuery({
    queryKey: ['a+-grades', courseId],
    queryFn: async () =>
      NewGradeArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/aplus-fetch`)).data
      ),
    ...options,
  });
