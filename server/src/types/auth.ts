// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AuthData} from '@/common/types';

export type FullLoginResult = AuthData & {
  forcePasswordReset: boolean | null;
};
