// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, SystemRole} from '@common/types';
import {NextFunction, Request, Response} from 'express';

import {JwtClaims} from '../types';
import {isTeacherInChargeOrAdmin} from '../controllers/utils/user';

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
export function authorization(
  allowedRoles: Array<SystemRole>
): (req: Request, res: Response, next: NextFunction) => void {
  return async function (req: Request, res: Response, next: NextFunction) {
    const user: JwtClaims = req.user as JwtClaims;

    if (!allowedRoles.includes(user.role)) {
      res.status(HttpCode.Forbidden).send({
        success: false,
        errors: ['forbidden'],
      });
      return;
    }
    next();
  };
}

export function teacherInCharge(): (
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return async function (req: Request, res: Response, next: NextFunction) {
    const courseId = Number(req.params.courseId);
    try {
      await isTeacherInChargeOrAdmin(
        req.user as JwtClaims,
        courseId,
        HttpCode.Forbidden
      );
      next();
    } catch (e) {
      res.status(HttpCode.Forbidden).send({
        success: false,
        errors: ['forbidden'],
      });
      return;
    }
  };
}
