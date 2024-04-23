// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Request, Response} from 'express';

import {HttpCode, SystemRole} from '@common/types';
import {
  isAdminOrOwner,
  isTeacherInChargeOrAdmin,
} from '../controllers/utils/user';
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

type HandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
/**
 * Validates that the user is either an admin or the teacher in charge for the given course.
 * Do not use in a controller, instead prefer the middleware.
 */
export const teacherInCharge = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => void) => {
  const handler: HandlerType = async (req, res, next) => {
    const result = stringToIdSchema.safeParse(req.params.courseId);
    if (!result.success) {
      return res.status(HttpCode.BadRequest).send({
        success: false,
        errors: [`Invalid course id ${req.params.courseId}`],
      });
    }

    try {
      await isTeacherInChargeOrAdmin(req.user as JwtClaims, result.data);
      return next();
    } catch (e) {
      return res
        .status(HttpCode.Forbidden)
        .send({success: false, errors: ['forbidden']});
    }
  };

  // To avoid async
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};

/**
 * Validates that the user is either an admin or the same user as in the url param.
 * Do not use in a controller, instead prefer the middleware.
 */
export const adminOrOwner = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => void) => {
  return (req, res, next) => {
    const result = stringToIdSchema.safeParse(req.params.userId);
    if (!result.success) {
      return res.status(HttpCode.BadRequest).send({
        success: false,
        errors: [`Invalid course id ${req.params.courseId}`],
      });
    }

    try {
      isAdminOrOwner(req.user as JwtClaims, result.data);
      return next();
    } catch (e) {
      return res
        .status(HttpCode.Forbidden)
        .send({success: false, errors: ['forbidden']});
    }
  };
};
