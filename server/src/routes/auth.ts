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
  ResetPasswordDataSchema,
  SystemRole,
} from '@/common/types';
import {
  changePassword,
  authLogin,
  authLogout,
  authResetOwnPassword,
  authSamlLogin,
  selfInfo,
  resetPassword,
  samlMetadata,
} from '../controllers/auth';
import {handleInvalidRequestJson} from '../middleware';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {authLogger} from '../middleware/requestLogger';

export const router = Router();

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  controllerDispatcher(selfInfo)
);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/login',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(LoginDataSchema),
  authLogin
);

router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  authLogger,
  authLogout
);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/reset-password',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ResetPasswordDataSchema),
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
