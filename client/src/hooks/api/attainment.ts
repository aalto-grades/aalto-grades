// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types/attainment';
import axios from './axios';
import {
  useMutation, UseMutationResult, useQuery, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric,
  tree?: 'children' | 'descendants'
): UseQueryResult<AttainmentData> {

  const query: string = tree ? `?tree=${tree}` : '';

  return useQuery({
    queryKey: ['attainment', courseId, assessmentModelId, attainmentId, query],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
        + `/attainments/${attainmentId}${query}`
      )
    ).data.data.attainment
  });
}

export function useGetRootAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  tree?: 'children' | 'descendants'
): UseQueryResult<AttainmentData> {

  const query: string = tree ? `?tree=${tree}` : '';

  return useQuery({
    queryKey: ['root-attainment', courseId, assessmentModelId, query],
    queryFn: async () => (
      await axios.get(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}${query}`
      )
    ).data.data.attainment
  });
}

export function useAddAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): UseMutationResult<AttainmentData> {
  return useMutation({
    mutationFn: async () => (
      await axios.post(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/attainments`,
        attainment
      )
    ).data.data.attainment
  });
}

export function useEditAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): UseMutationResult<AttainmentData> {
  return useMutation({
    mutationFn: async () => (
      await axios.put(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
        + `/attainments/${attainment.id}`,
        attainment
      )
    ).data.data.attainment
  });
}

export function useDeleteAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric
): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.delete(
        `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
        + `/attainments/${attainmentId}`
      )
    ).data.data.attainment
  });
}
