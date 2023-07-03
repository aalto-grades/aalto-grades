// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  success: boolean,
  data?: T,
  errors?: Array<string>
}

export type FullResponse<T> = AxiosResponse<ApiResponse<T>, unknown>;

export type Numeric = number | string;

export interface Message {
  msg: string | Array<string>,
  severity?: 'error' | 'warning' | 'info' | 'success'
}

export type State<T> = [T, (value: T) => void];

export interface NewCourseData extends Omit<
CourseData, 'teachersInCharge' | 'id' | 'evaluationInformation'
> {
  teachersInCharge: Array<string>;
}
