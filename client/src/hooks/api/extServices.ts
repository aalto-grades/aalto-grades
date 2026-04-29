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
import {
  type ExtServiceImportStreamEvent,
  ExtServiceImportStreamEventSchema,
  ExtServiceImportStreamEventType,
} from '@/common/types/extServiceImport';
import type {Numeric} from '@/types';
import {getServiceToken} from '@/utils';
import axios from './axios';

type ServiceInfo = {
  id: string;
  tokenLink?: string;
};

export type {ExtServiceImportStreamEvent};
export {ExtServiceImportStreamEventType};

const getHeaders = (serviceInfo: ServiceInfo): AxiosRequestConfig => ({
  headers: {
    Authorization: `${serviceInfo.id}-Token ${getServiceToken(serviceInfo.id)}`,
  } as AxiosRequestConfig['headers'],
});

const getErrorMessage = async (response: Response): Promise<string> => {
  const responseText = await response.text();

  if (!responseText) {
    return `${response.status} - ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(responseText) as
      | {errors?: string[]}
      | Array<{errors?: {issues?: Array<{message: string}>}}>;

    if ('errors' in parsed && Array.isArray(parsed.errors)) {
      return `${response.status} - ${response.statusText}: ${parsed.errors.join(', ')}`;
    }

    if (Array.isArray(parsed) && parsed[0]?.errors?.issues) {
      return `${response.status} - ${response.statusText}: ${parsed[0].errors.issues.map(issue => issue.message).join(', ')}`;
    }
  } catch {
    return `${response.status} - ${response.statusText}: ${responseText}`;
  }

  return `${response.status} - ${response.statusText}: ${responseText}`;
};

export const fetchExtServiceGradesStream = async (
  courseId: Numeric,
  courseTaskIds: number[],
  serviceInfo: ServiceInfo,
  onEvent?: (event: ExtServiceImportStreamEvent) => void,
  signal?: AbortSignal,
): Promise<NewTaskGrade[]> => {
  const response = await fetch(
    `/api/v1/ext-source/${serviceInfo.id}/courses/${courseId}/fetch-stream`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${serviceInfo.id}-Token ${getServiceToken(serviceInfo.id)}`,
      },
      body: JSON.stringify({courseTaskIds}),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (!response.body) {
    throw new Error('Streaming is not supported in this browser');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalGrades: NewTaskGrade[] | null = null;

  const processLine = (line: string): void => {
    if (!line.trim()) {
      return;
    }

    const parsedEvent = ExtServiceImportStreamEventSchema.safeParse(
      JSON.parse(line),
    );
    if (!parsedEvent.success) {
      throw new Error(parsedEvent.error.message);
    }

    const event = parsedEvent.data;
    onEvent?.(event);

    if (event.type === ExtServiceImportStreamEventType.Error) {
      throw new Error(event.message);
    }

    if (event.type === ExtServiceImportStreamEventType.Result) {
      finalGrades = event.grades;
    }
  };

  while (true) {
    const {done, value} = await reader.read();

    buffer += decoder.decode(value, {stream: !done});
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      processLine(line);
    }

    if (done) {
      if (buffer.trim()) {
        processLine(buffer);
      }
      break;
    }
  }

  if (finalGrades === null) {
    throw new Error('Import ended before grades were returned');
  }

  return finalGrades;
};

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
