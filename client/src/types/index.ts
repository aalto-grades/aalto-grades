// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Language} from '@/common/types';

export type HeadCellData = {
  id: string;
  label: string;
};

export type Numeric = number | string;

export type LanguageOption = {
  id: Language;
  language: string;
};
