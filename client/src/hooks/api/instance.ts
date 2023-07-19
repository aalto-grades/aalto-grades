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
    ).data.data.courseInstances,
    ...options
  });
}

export function useAddInstance(
  courseId: Numeric,
  instance: CourseInstanceData,
  options?: UseMutationOptions<number, unknown, unknown>
): UseMutationResult<number> {
  return useMutation({
    mutationFn: async () => (
      await axios.post(`/v1/courses/${courseId}/instances`, instance)
    ).data.data.courseInstance.id,
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
    ).data.data.courseInstance,
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
    ).data.data.courseInstances,
    ...options
  });
}
