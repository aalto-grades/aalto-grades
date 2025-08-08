// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, Response} from 'express';
import {z} from 'zod';

import type {CourseRoleType, SystemRole} from '@/common/types';
import type Course from '../database/models/course';
import type CourseTranslation from '../database/models/courseTranslation';
import type User from '../database/models/user';

// Endpoint types
interface TypedRequestBody<T> extends Request {
  body: T;
  // user?: JwtClaims;
}

export type SyncEndpoint<ReqType, ResType> = (
  req: TypedRequestBody<ReqType>,
  res: Response<ResType | {errors: string[]}>,
  next: NextFunction
) => void | Response;

export type Endpoint<ReqType, ResType> = (
  req: TypedRequestBody<ReqType>,
  res: Response<ResType | {errors: string[]}>,
  next: NextFunction
) => Promise<void | Response>;

// Other
export const stringToIdSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(val => parseInt(val, 10))
  .pipe(z.number().int().min(1));

export const nonEmptyStringSchema = z.string().min(1).max(25);

export type JwtClaims = {role: SystemRole; id: number};

export type UserWithRole = User & {
  CourseRole: {role: CourseRoleType; expiryDate: string};
};
export type CourseFull = Course & {
  CourseTranslations: CourseTranslation[];
  Users: UserWithRole[];
};
