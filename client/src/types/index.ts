// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Language} from '@common/types';
import {Dispatch, SetStateAction} from 'react';

export interface ApiResponse<T> {
  data?: T;
  errors?: Array<string>;
}

export interface HeadCellData {
  id: string;
  label: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type Numeric = number | string;

export type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface LanguageOption {
  id: Language;
  language: string;
}
