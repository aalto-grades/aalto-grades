// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dispatch, SetStateAction} from 'react';

import {Language} from '@/common/types';

export type HeadCellData = {
  id: string;
  label: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type Numeric = number | string;

export type State<T> = [T, Dispatch<SetStateAction<T>>];

export type LanguageOption = {
  id: Language;
  language: string;
};
