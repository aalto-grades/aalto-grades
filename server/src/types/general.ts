// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Request, Response} from 'express';
import {z} from 'zod';

import {CourseRoleType, SystemRole} from '@/common/types';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

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
  .pipe(z.coerce.number().int().min(1));

export type JwtClaims = {role: SystemRole; id: number};

type UserWithRole = User & {CourseRole: {role: CourseRoleType}};
export type CourseFull = Course & {
  CourseTranslations: CourseTranslation[];
  Users: UserWithRole[];
};
