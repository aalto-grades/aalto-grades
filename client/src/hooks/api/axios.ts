// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import i18next from 'i18next';
import type {ZodError} from 'zod';

const axiosInstance = axios.create({
  withCredentials: true,
  validateStatus: (status: number) => status < 600 && status >= 100,
});

axiosInstance.interceptors.response.use(response => {
  const resData = response.data as
    | {errors: string[]}
    | {errors: ZodError}[]
    | null; // Type is missing non-error states

  // Zod error
  if (response.status === 400 && Array.isArray(resData)) {
    const resErrors = resData[0];
    throw new Error(
      `${response.status} - ${response.statusText}: ` +
        resErrors.errors.issues
          .map(issue => `'/${issue.path.join('/')} : ${issue.message}'`)
          .join(', ')
    );
  }

  // Token expired error
  if (response.status === 401) {
    throw new Error(i18next.t('shared.auth.token-expired'));
  }

  // Other errors
  if (resData !== null && typeof resData === 'object' && 'errors' in resData) {
    throw new Error(
      `${response.status} - ${response.statusText}: ` +
        resData.errors.join(', ')
    );
  }

  return response;
});

export default axiosInstance;
