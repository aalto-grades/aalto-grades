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
  CoursePartData,
  CoursePartDataArraySchema,
  EditCoursePartData,
  IdSchema,
  NewCoursePartData,
} from '@/common/types';
import {Numeric} from '@/types';
import axios from './axios';

export const useGetCourseParts = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CoursePartData[]>>
): UseQueryResult<CoursePartData[]> =>
  useQuery({
    queryKey: ['course-parts', courseId],
    queryFn: async () =>
      CoursePartDataArraySchema.parse(
        (await axios.get(`/v1/courses/${courseId}/parts`)).data
      ),
    ...options,
  });

export const useAddCoursePart = (
  courseId: Numeric,
  options?: UseMutationOptions<number, unknown, NewCoursePartData>
): UseMutationResult<number, unknown, NewCoursePartData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async coursePart =>
      IdSchema.parse(
        (await axios.post(`/v1/courses/${courseId}/parts`, coursePart)).data
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
  options?: UseMutationOptions<void, unknown, EditCoursePartVars>
): UseMutationResult<void, unknown, EditCoursePartVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vars =>
      axios.put(
        `/v1/courses/${courseId}/parts/${vars.coursePartId}`,
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
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursePartId =>
      axios.delete(`/v1/courses/${courseId}/parts/${coursePartId}`),

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
