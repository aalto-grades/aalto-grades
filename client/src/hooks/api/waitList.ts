// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {Numeric} from '@/types';
import type {
  EditWaitListEntry,
  NewWaitListEntry,
  WaitListEntryData,
  WaitListImportEntry,
  WaitListRelease,
} from '@/types/waitList';
import axios from './axios';

export const useGetWaitList = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<WaitListEntryData[]>>
): UseQueryResult<WaitListEntryData[]> =>
  useQuery({
    queryKey: ['wait-list', courseId],
    queryFn: async () =>
      (await axios.get<WaitListEntryData[]>(
        `/api/v1/courses/${courseId}/wait-list`
      )).data,
    ...options,
  });

export const useAddWaitListEntries = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, NewWaitListEntry[]>
): UseMutationResult<void, unknown, NewWaitListEntry[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async entries =>
      axios.post(`/api/v1/courses/${courseId}/wait-list`, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wait-list', courseId]});
    },
    ...options,
  });
};

export const useEditWaitListEntries = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, EditWaitListEntry[]>
): UseMutationResult<void, unknown, EditWaitListEntry[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async entries =>
      axios.put(`/api/v1/courses/${courseId}/wait-list`, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wait-list', courseId]});
    },
    ...options,
  });
};

export const useImportWaitListEntries = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, WaitListImportEntry[]>
): UseMutationResult<void, unknown, WaitListImportEntry[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async entries =>
      axios.post(`/api/v1/courses/${courseId}/wait-list/import`, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wait-list', courseId]});
    },
    ...options,
  });
};

export const useReleaseWaitListEntries = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, WaitListRelease>
): UseMutationResult<void, unknown, WaitListRelease> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async data =>
      axios.post(`/api/v1/courses/${courseId}/wait-list/release`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wait-list', courseId]});
      queryClient.invalidateQueries({queryKey: ['grades', courseId]});
    },
    ...options,
  });
};

export const useDeleteWaitListEntries = (
  courseId: Numeric,
  options?: UseMutationOptions<void, unknown, number[]>
): UseMutationResult<void, unknown, number[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async entryIds =>
      axios.post(`/api/v1/courses/${courseId}/wait-list/delete`, entryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wait-list', courseId]});
    },
    ...options,
  });
};
