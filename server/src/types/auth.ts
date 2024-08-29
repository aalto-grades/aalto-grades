// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {Response} from 'express';

import type {AuthData} from '@/common/types';

export type LoginCallback = (
  error: unknown,
  loginResult?: AuthData | false
) => (void | Response) | Promise<void | Response>;
