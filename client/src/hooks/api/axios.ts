// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import {ZodError} from 'zod';

const BACKEND_URL =
  (import.meta.env.VITE_APP_BACKEND_URL as string | undefined) ||
  'http://back-end';
const BACKEND_PORT =
  (import.meta.env.VITE_APP_BACKEND_PORT as string | undefined) || '3000';

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}:${BACKEND_PORT}`,
  withCredentials: true,
  validateStatus: (status: number) => status < 600 && status >= 100,
});

axiosInstance.interceptors.response.use(response => {
  const resData = response.data as {errors: string[]} | {errors: ZodError}[]; // Type is missing non-error states

  // Zod error
  if (response.status === 400 && Array.isArray(resData)) {
    const resErrors = resData[0];
    console.log(resErrors.errors.issues);
    throw new Error(
      `${response.status} - ${response.statusText}: ` +
        resErrors.errors.issues
          .map(issue => `'/${issue.path.join('/')} : ${issue.message}'`)
          .join(', ')
    );
  }

  // Other errors
  if ('errors' in resData) {
    throw new Error(
      `${response.status} - ${response.statusText}: ` +
        resData.errors.join(', ')
    );
  }

  return response;
});

export default axiosInstance;
