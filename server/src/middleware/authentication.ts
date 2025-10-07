// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, RequestHandler, Response} from 'express';
import passport from 'passport';

import {SystemRole, UserData} from '@/common/types';
import {HttpCode} from '@/common/types/general';
import type {JwtClaims} from '../types';

export const jwtAuthentication = (
  req: Request & {skipJwtAuth?: boolean},
  res: Response,
  next: NextFunction
): void => {
  if (req.skipJwtAuth) {
    return next();
  }
  const authenticate = passport.authenticate(
    'jwt',
    {session: false},
    (
      info: object | null,
      user: JwtClaims | false | null,
      error: object | string | Array<string | undefined>
    ) => {
      if (!user) {
        if (error instanceof Error) {
          return res.status(HttpCode.Unauthorized).send({
            errors: [error.name],
          });
        } else {
          return res.status(HttpCode.Unauthorized).send({
            errors: ['JwtAuthenticationError'],
          });
        }
      } else {
        req.user = user;
        next();
      }
    }
  ) as RequestHandler;
  authenticate(req, res, next);
};

/**
 * API Key authentication for external services
 */
export const apiKeyAuthentication = (
  req: Request & {skipJwtAuth?: boolean},
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    // No API key, continue to JWT authentication
    return next();
  }

  // Get valid API keys from environment
  const validApiKeys: Record<string, string> = {
    'students-service': process.env.STUDENTS_SERVICE_API_KEY || '',
    // 'another-service': process.env.ANOTHER_SERVICE_API_KEY || '',
  };
  console.log('Valid API Keys:', validApiKeys); // Debugging line
  // Check if provided API key is valid
  const serviceMatch = Object.entries(validApiKeys).find(([_, key]) => key === apiKey);

  if (!serviceMatch) {
    return res.status(403).json({error: 'Invalid API key'});
  }

  const serviceName = serviceMatch[0];

  // Create a mock user context for compatibility with JWT flow
  const mockUserContext: JwtClaims = {
    id: -1,
    role: SystemRole.Admin,
    // isServiceAccount: true,
  };
  req.user = mockUserContext;

  // Log service access (optional)
  console.log(`Service access: ${serviceName} accessed ${req.path}`);

  // Skip JWT auth since we're already authenticated
  req.skipJwtAuth = true;

  next();
};
