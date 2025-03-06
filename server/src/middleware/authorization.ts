// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, Response} from 'express';

import {CourseRoleType, HttpCode, SystemRole} from '@/common/types';
import {getUserCourseRole} from '../controllers/utils/user';
import {type JwtClaims, stringToIdSchema} from '../types';

/**
 * Middleware function to ensure that the user has the necessary role to
 * proceed.
 *
 * @example
 *   // Protect an endpoint so only admins can access it.
 *   app.post('/v1/courses', authorization([SystemRole.Admin]), (req, res) => { ... });
 */
export const authorization = (
  allowedRoles: SystemRole[]
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtClaims;

    if (!allowedRoles.includes(user.role)) {
      return res.status(HttpCode.Forbidden).send({
        errors: ['Forbidden'],
      });
    }
    return next();
  };
};

type HandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Validates that the user is either an admin or has one of the given roles in
 * the course.
 */
export const courseAuthorization = (
  allowedRoles: CourseRoleType[]
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const handler: HandlerType = async (req, res, next) => {
    const user = req.user as JwtClaims;
    if (user.role === SystemRole.Admin) return next(); // Allow admins

    const result = stringToIdSchema.safeParse(req.params.courseId);
    if (!result.success) {
      return res.status(HttpCode.BadRequest).send({
        errors: [`Invalid course id ${req.params.courseId}`],
      });
    }

    try {
      const courseRole = await getUserCourseRole(
        result.data,
        req.user as JwtClaims
      );
      if (
        courseRole.role === CourseRoleType.Assistant &&
        courseRole.expiryDate
      ) {
        const currentDate = new Date();
        const expiryDate = new Date(courseRole.expiryDate);
        if (expiryDate < currentDate) {
          return res
            .status(HttpCode.Forbidden)
            .send({errors: ['Course Role Expired']});
        }
      }
      if (!allowedRoles.includes(courseRole.role)) {
        return res.status(HttpCode.Forbidden).send({errors: ['Forbidden']});
      }

      return next();
    } catch {
      return res.status(HttpCode.Forbidden).send({errors: ['Forbidden']});
    }
  };

  // To avoid async
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};
