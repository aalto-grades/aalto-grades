// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Dispatch, SetStateAction } from 'react';
import { AxiosResponse } from 'axios';
import { SystemRole } from 'aalto-grades-common/types';

export interface ApiResponse<T> {
  success: boolean,
  data: T,
  errors?: Array<string>
}

export type FullResponse<T> = AxiosResponse<ApiResponse<T>, unknown>;

export interface HeadCellData {
  id: string,
  label: string
}

export interface LoginCredentials {
  email: string,
  password: string
}

export interface Message {
  msg: string | Array<string>,
  severity?: 'error' | 'warning' | 'info' | 'success'
}

export type Numeric = number | string;

export interface SignupCredentials {
  email: string,
  password: string,
  studentNumber?: string,
  name: string,
  role: SystemRole
}

export type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface TextFieldData {
  fieldId: string,
  fieldLabel: string,
  fieldHelperText?: string
}
