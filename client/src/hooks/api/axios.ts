// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import {t} from 'i18next';

import LoginAgainButton from '@/components/shared/LoginAgainButton';
import {CustomError} from '@/types';
import {extractZodIssues, formatZodIssues} from '@/utils/apiErrors';

const axiosInstance = axios.create({
  withCredentials: true,
  validateStatus: (status: number) => status < 600 && status >= 100,
});

axiosInstance.interceptors.response.use((response) => {
  const resData = response.data as
    | {errors: string[]}
    | Array<{type: string; errors: unknown}>
    | null; // Type is missing non-error states

  // Zod error
  if (response.status === 400 && Array.isArray(resData)) {
    const issues = extractZodIssues(resData);
    if (issues !== null) {
      throw new CustomError({
        message: `${response.status} - ${response.statusText}: ${formatZodIssues(issues)}`,
        issues,
      });
    }
    throw new Error(
      `${response.status} - ${response.statusText}: ${JSON.stringify(resData)}`
    );
  }

  // Other errors
  if (resData !== null && typeof resData === 'object' && 'errors' in resData) {
    // Token expired error
    if (
      resData.errors.includes('TokenExpiredError')
      || resData.errors.includes('JsonWebTokenError')
    ) {
      throw new CustomError({
        message: t('shared.auth.token.expired'),
        action: LoginAgainButton,
      });
    } else {
      throw new Error(
        `${response.status} - ${response.statusText}: `
        + resData.errors.join(', ')
      );
    }
  }

  return response;
});

export default axiosInstance;
