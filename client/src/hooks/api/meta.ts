// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

import {
  type ClientEnvVariables,
  ClientEnvVariablesSchema,
} from '@/common/types';
import axios from './axios';

export const useGetClientEnvVariables = (
  options?: UseQueryOptions<ClientEnvVariables>
): UseQueryResult<ClientEnvVariables> =>
  useQuery({
    queryKey: ['client-env-variables'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/client-env-variables');
      return ClientEnvVariablesSchema.parse(response.data);
    },
    ...options,
  });
