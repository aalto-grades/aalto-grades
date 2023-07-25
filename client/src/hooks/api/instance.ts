// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationOptions, UseMutationResult,
  useQuery, UseQueryOptions, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetAllInstances(
  courseId: Numeric,
  options?: UseQueryOptions<Array<CourseInstanceData>>
): UseQueryResult<Array<CourseInstanceData>> {
  return useQuery({
    queryKey: ['all-instances', courseId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}/instances`)
    ).data.data,
    ...options
  });
}

interface AddInstanceVars {
  courseId: Numeric,
  instance: CourseInstanceData
}

export type UseAddInstanceResult = UseMutationResult<
  number, unknown, AddInstanceVars
>;

export function useAddInstance(
  options?: UseMutationOptions<number, unknown, unknown>
): UseAddInstanceResult {
  return useMutation({
    mutationFn: async (vars: AddInstanceVars) => (
      await axios.post(`/v1/courses/${vars.courseId}/instances`, vars.instance)
    ).data.data,
    ...options
  });
}

export function useGetSisuInstance(
  sisuInstanceId: string,
  options?: UseQueryOptions<CourseInstanceData>
): UseQueryResult<CourseInstanceData> {
  return useQuery({
    queryKey: ['sisu-instance', sisuInstanceId],
    queryFn: async () => (
      await axios.get(`/v1/sisu/instances/${sisuInstanceId}`)
    ).data.data,
    ...options
  });
}

export function useGetAllSisuInstances(
  courseCode: string,
  options?: UseQueryOptions<Array<CourseInstanceData>>
): UseQueryResult<Array<CourseInstanceData>> {
  return useQuery({
    queryKey: ['all-sisu-instances', courseCode],
    queryFn: async () => (
      await axios.get(`/v1/sisu/courses/${courseCode}`)
    ).data.data,
    ...options
  });
}
