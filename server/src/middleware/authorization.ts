// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Request, Response} from 'express';

import {HttpCode, SystemRole} from '@common/types';
import {isTeacherInChargeOrAdmin} from '../controllers/utils/user';
import {JwtClaims, stringToIdSchema} from '../types';

/**
 * Middleware function to ensure that the user has the necessary role to proceed.
 * @param {Array<SystemRole>} allowedRoles - List of roles that are permitted to access
 * the resource.
 * @returns {Function} Returns a middleware function that checks the user's role against
 * the allowed roles.
 *
 * @example
 * // Protect an endpoint so only admins can access it.
 * app.post('/v1/courses', authorization([SystemRole.Admin]), (req, res) => { ... });
 */
export const authorization = (
  allowedRoles: SystemRole[]
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtClaims;

    if (!allowedRoles.includes(user.role)) {
      res.status(HttpCode.Forbidden).send({
        success: false,
        errors: ['forbidden'],
      });
      return;
    }
    next();
  };
};

export const teacherInCharge = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = stringToIdSchema.safeParse(req.params.courseId);
    if (!result.success) {
      res.status(HttpCode.BadRequest).send({
        success: false,
        errors: [`Invalid course id ${req.params.courseId}`],
      });
      return;
    }

    try {
      await isTeacherInChargeOrAdmin(req.user as JwtClaims, result.data);
      next();
    } catch (e) {
      res
        .status(HttpCode.Forbidden)
        .send({success: false, errors: ['forbidden']});
      return;
    }
  };
};
