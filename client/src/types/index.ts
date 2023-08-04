// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SystemRole } from 'aalto-grades-common/types';
import { Dispatch, SetStateAction } from 'react';

export interface ApiResponse<T> {
  data?: T,
  errors?: Array<string>
}

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
