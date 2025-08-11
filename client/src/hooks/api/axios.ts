// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import {t} from 'i18next';
import type {ZodError} from 'zod';

import LoginAgainButton from '@/components/shared/LoginAgainButton';
import {CustomError} from '@/types';

const axiosInstance = axios.create({
  withCredentials: true,
  validateStatus: (status: number) => status < 600 && status >= 100,
});

axiosInstance.interceptors.response.use((response) => {
  const resData = response.data as
    | {errors: string[]}
    | {errors: ZodError}[]
    | null; // Type is missing non-error states

  // Zod error
  if (response.status === 400 && Array.isArray(resData)) {
    const resErrors = resData[0];
    throw new Error(
      `${response.status} - ${response.statusText}: `
      + resErrors.errors.issues
        .map(issue => `'/${issue.path.join('/')} : ${issue.message}'`)
        .join(', ')
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
