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

import {IdSchema} from '@/common/types';
import {
  CoursePartData,
  CoursePartDataArraySchema,
  EditCoursePartData,
  NewCoursePartData,
} from '@/common/types/coursePart';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetCourseParts = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CoursePartData[]>>
): UseQueryResult<CoursePartData[]> =>
  useQuery({
    queryKey: ['course-parts', courseId],
    queryFn: async () =>
      CoursePartDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/course-parts`)).data
      ),
    ...options,
  });

export const useAddCoursePart = (
  courseId: Numeric,
  options?: UseMutationOptions<number, unknown, NewCoursePartData>
): UseMutationResult<number, unknown, NewCoursePartData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coursePart: NewCoursePartData) =>
      IdSchema.parse(
        (await axios.post(`/v1/courses/${courseId}/course-parts`, coursePart))
          .data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });
    },
    ...options,
  });
};

type EditCoursePartVars = {
  coursePartId: Numeric;
  coursePart: EditCoursePartData;
};
export const useEditCoursePart = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, EditCoursePartVars>
): UseMutationResult<unknown, unknown, EditCoursePartVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditCoursePartVars) =>
      await axios.put(
        `/v1/courses/${courseId}/course-parts/${vars.coursePartId}`,
        vars.coursePart
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};

export const useDeleteCoursePart = (
  courseId: Numeric,
  options?: UseMutationOptions<unknown, unknown, Numeric>
): UseMutationResult<unknown, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coursePartId: Numeric) =>
      await axios.delete(
        `/v1/courses/${courseId}/course-parts/${coursePartId}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-parts', courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ['all-grading-models', courseId],
      });
    },
    ...options,
  });
};
