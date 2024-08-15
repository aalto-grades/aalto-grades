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
        (await axios.get(`/v1/courses/${courseId}/tasks`)).data
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
        (await axios.post(`/v1/courses/${courseId}/parts`, courseTask)).data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

// type EditCoursePartVars = {
//   coursePartId: Numeric;
//   coursePart: EditCoursePartData;
// };
// export const useEditCoursePart = (
//   courseId: Numeric,
//   options?: UseMutationOptions<void, unknown, EditCoursePartVars>
// ): UseMutationResult<void, unknown, EditCoursePartVars> => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: vars =>
//       axios.put(
//         `/v1/courses/${courseId}/parts/${vars.coursePartId}`,
//         vars.coursePart
//       ),

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['course-parts', courseId],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ['all-grading-models', courseId],
//       });
//     },
//     ...options,
//   });
// };

// export const useDeleteCoursePart = (
//   courseId: Numeric,
//   options?: UseMutationOptions<void, unknown, Numeric>
// ): UseMutationResult<void, unknown, Numeric> => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: coursePartId =>
//       axios.delete(`/v1/courses/${courseId}/parts/${coursePartId}`),

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['course-parts', courseId],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ['all-grading-models', courseId],
//       });
//     },
//     ...options,
//   });
// };
