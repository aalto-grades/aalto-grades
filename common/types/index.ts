// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export * from './assessmentModel';
export * from './attainment';
export * from './auth';
export * from './course';
export * from './finalGrade';
export * from './general';
export * from './grades';
export * from './language';
export * from './user';

export const IdSchema = z.number().int();
