// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Response} from 'express';

import {AuthData} from '@/common/types';

export type LoginCallback = (
  error: unknown,
  loginResult?: AuthData | false
) => (void | Response) | Promise<void | Response>;
