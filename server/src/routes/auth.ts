// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import bodyParser from 'body-parser';
import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  ChangePasswordDataSchema,
  LoginDataSchema,
  ResetAuthDataSchema,
  SystemRole,
} from '@/common/types';
import {
  authLogin,
  authLogout,
  authResetOwnPassword,
  authSamlLogin,
  changePassword,
  resetPassword,
  samlMetadata,
  selfInfo,
} from '../controllers/auth';
import {handleInvalidRequestJson} from '../middleware';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {rateLimiterMemoryMiddleware} from '../middleware/rateLimiterMemory';

export const router = Router();

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(selfInfo)
);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/login',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(LoginDataSchema),
  rateLimiterMemoryMiddleware,
  authLogin
);

router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogout
);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/reset-password',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ResetAuthDataSchema),
  rateLimiterMemoryMiddleware,
  authResetOwnPassword
);

router.post(
  '/v1/auth/reset-password/:userId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  controllerDispatcher(resetPassword)
);

router.post(
  '/v1/auth/change-password',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ChangePasswordDataSchema),
  controllerDispatcher(changePassword)
);

router.get(
  '/v1/auth/login-idp',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true,
    session: false,
  }) as RequestHandler,
  (req, res) => res.redirect('/')
);

router.post(
  '/v1/auth/login-idp/callback',
  bodyParser.urlencoded({extended: false}),
  authSamlLogin,
  (req, res) => res.redirect('/')
);

router.get('/v1/auth/saml/metadata', controllerDispatcher(samlMetadata));
