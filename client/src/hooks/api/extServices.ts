// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {AxiosRequestConfig} from 'axios';

import {
  type AplusCourseData,
  AplusCourseDataArraySchema,
  type ExtServiceExerciseData,
  ExtServiceExerciseDataSchema,
  type NewExtServiceGradeSourceData,
  type NewTaskGrade,
  NewTaskGradeArraySchema,
} from '@/common/types';
import type {Numeric} from '@/types';
import {getServiceToken} from '@/utils';
import axios from './axios';

type ServiceInfo = {
  id: string;
  tokenLink?: string;
};

const getHeaders = (serviceInfo: ServiceInfo): AxiosRequestConfig => ({
  headers: {Authorization: `${serviceInfo.id}-Token ${getServiceToken(serviceInfo.id)}`},
});

export const useFetchExtServiceCourses = (
  serviceInfo: ServiceInfo,
  options?: Partial<UseQueryOptions<AplusCourseData[]>>
): UseQueryResult<AplusCourseData[]> =>
  useQuery({
    queryKey: [`${serviceInfo.id}-courses`],
    queryFn: async () =>
      AplusCourseDataArraySchema.parse(
        (
          await axios.get(
            `/api/v1/ext-source/${serviceInfo.id}/courses`,
            getHeaders(serviceInfo)
          )
        ).data
      ),
    ...options,
  });

export const useFetchExtServiceExerciseData = (
  serviceInfo: ServiceInfo,
  serviceCourseId: Numeric,
  options?: Partial<UseQueryOptions<ExtServiceExerciseData>>
): UseQueryResult<ExtServiceExerciseData> =>
  useQuery({
    queryKey: [`${serviceInfo.id}-exercises`, serviceCourseId],
    queryFn: async () =>
      ExtServiceExerciseDataSchema.parse(
        (
          await axios.get(
            `/api/v1/ext-source/${serviceInfo.id}/courses/${serviceCourseId}`,
            getHeaders(serviceInfo)
          )
        ).data
      ),
    ...options,
  });

export const useAddExtServiceGradeSources = (
  serviceInfo: ServiceInfo,
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewExtServiceGradeSourceData[]>
): UseMutationResult<void, unknown, NewExtServiceGradeSourceData[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async gradeSources =>
      axios.post(
        `/api/v1/ext-source/${serviceInfo.id}/courses/${courseId}/sources`,
        gradeSources
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

export const useDeleteExtServiceGradeSource = (
  serviceInfo: ServiceInfo,
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, Numeric>
): UseMutationResult<void, unknown, Numeric> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async externalSourceId =>
      axios.delete(
        `/api/v1/ext-source/${serviceInfo.id}/courses/${courseId}/sources/${externalSourceId}`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-tasks', courseId],
      });
    },
    ...options,
  });
};

export const getExtServiceGradesQuery = (
  courseId: Numeric,
  courseTaskIds: number[],
  serviceInfo: ServiceInfo
) => ({
  queryKey: [`${serviceInfo.id}-grades`, courseId, courseTaskIds],
  queryFn: async () =>
    NewTaskGradeArraySchema.parse(
      (
        await axios.get(
          `/api/v1/ext-source/${serviceInfo.id}/courses/${courseId}/fetch?course-tasks=${JSON.stringify(
            courseTaskIds
          )}`,
          getHeaders(serviceInfo)
        )
      ).data
    ),
});

export const useGetExtServiceGradesForServices = (
  courseId: Numeric,
  courseTaskIdsByService: Record<string, number[]>,
  serviceInfos: ServiceInfo[],
  options?: Partial<UseQueryOptions<NewTaskGrade[]>>
): UseQueryResult<NewTaskGrade[]>[] =>
  useQueries({
    queries: serviceInfos.map(serviceInfo => ({
      ...getExtServiceGradesQuery(
        courseId,
        courseTaskIdsByService[serviceInfo.id] ?? [],
        serviceInfo
      ),
      ...options,
    })),
  });
