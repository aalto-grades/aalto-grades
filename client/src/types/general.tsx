// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  success: boolean,
  data?: T,
  errors?: Array<string>
}

export type FullResponse<T> = AxiosResponse<ApiResponse<T>, unknown>;

export type Numeric = number | string;

export interface Message {
  msg: string,
  severity?: 'error' | 'warning' | 'info' | 'success'
}
