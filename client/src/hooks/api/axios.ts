// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosResponse } from 'axios';

import { ApiResponse } from '../../types';

const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://back-end';
const BACKEND_PORT: string = process.env.REACT_APP_BACKEND_PORT || '3000';

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}:${BACKEND_PORT}`,
  withCredentials: true,
  validateStatus: (status: number) => status < 600 && status >= 100
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res: ApiResponse<unknown> = response.data;
    if (res.errors) {
      throw new Error(
        `${response.status} - ${response.statusText}`
        + res.errors.map((str: string) => ', ' + str)
      );
    }

    return response;
  }
);

export default axiosInstance;
