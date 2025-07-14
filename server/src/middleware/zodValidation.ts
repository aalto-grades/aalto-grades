// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, Response} from 'express';
import type {ZodSchema, ZodError} from 'zod';

import {HttpCode} from '@/common/types';

/**
 * Custom Zod validation middleware as a replacement for the outdated zod-express-middleware.
 * Validates request body using the provided Zod schema.
 */
export const processRequestBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        res.status(HttpCode.BadRequest).json([
          {
            type: 'Body',
            errors: result.error,
          },
        ]);
        return;
      }
      
      // Replace the request body with the parsed and validated data
      req.body = result.data;
      next();
    } catch (error) {
      res.status(HttpCode.InternalServerError).json([
        {
          type: 'Body',
          errors: {
            issues: [{ message: 'Internal validation error' }],
          },
        },
      ]);
      return;
    }
  };
};

/**
 * Custom Zod validation middleware for validating request body (alias for processRequestBody).
 * Validates request body using the provided Zod schema without processing/transforming the data.
 */
export const validateRequestBody = processRequestBody;

/**
 * Custom Zod validation middleware for validating query parameters.
 */
export const processRequestQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        res.status(HttpCode.BadRequest).json([
          {
            type: 'Query',
            errors: result.error,
          },
        ]);
        return;
      }
      
      req.query = result.data as any;
      next();
    } catch (error) {
      res.status(HttpCode.InternalServerError).json([
        {
          type: 'Query',
          errors: {
            issues: [{ message: 'Internal validation error' }],
          },
        },
      ]);
      return;
    }
  };
};

/**
 * Custom Zod validation middleware for validating route parameters.
 */
export const processRequestParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        res.status(HttpCode.BadRequest).json([
          {
            type: 'Params',
            errors: result.error,
          },
        ]);
        return;
      }
      
      req.params = result.data as any;
      next();
    } catch (error) {
      res.status(HttpCode.InternalServerError).json([
        {
          type: 'Params',
          errors: {
            issues: [{ message: 'Internal validation error' }],
          },
        },
      ]);
      return;
    }
  };
};

/**
 * Validates request body, query, and params using the provided schemas.
 */
export const processRequest = <T extends Record<string, ZodSchema>>(schemas: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{type: string; errors: ZodError}> = [];

      // Validate body
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          errors.push({ type: 'Body', errors: bodyResult.error });
        } else {
          req.body = bodyResult.data;
        }
      }

      // Validate query
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          errors.push({ type: 'Query', errors: queryResult.error });
        } else {
          req.query = queryResult.data as any;
        }
      }

      // Validate params
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          errors.push({ type: 'Params', errors: paramsResult.error });
        } else {
          req.params = paramsResult.data as any;
        }
      }

      if (errors.length > 0) {
        res.status(HttpCode.BadRequest).json(errors);
        return;
      }

      next();
    } catch (error) {
      res.status(HttpCode.InternalServerError).json([
        {
          type: 'Internal',
          errors: {
            issues: [{ message: 'Internal validation error' }],
          },
        },
      ]);
      return;
    }
  };
};
