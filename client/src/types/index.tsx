// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Dispatch, SetStateAction } from 'react';
import { AxiosResponse } from 'axios';

export * from './auth';

export interface ApiResponse<T> {
  success: boolean,
  data: T,
  errors?: Array<string>
}

export type FullResponse<T> = AxiosResponse<ApiResponse<T>, unknown>;

export type Numeric = number | string;

export interface Message {
  msg: string | Array<string>,
  severity?: 'error' | 'warning' | 'info' | 'success'
}

export interface TextFieldData {
  fieldId: string,
  fieldLabel: string,
  fieldHelperText?: string
}

export interface HeadCellData {
  id: string,
  label: string
}

export type State<T> = [T, Dispatch<SetStateAction<T>>];
