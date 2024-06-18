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
} from '@/common/types';
import {
  authChangePassword,
  authLogin,
  authLogout,
  authResetPassword,
  authSamlLogin,
  authSelfInfo,
  samlMetadata,
} from '../controllers/auth';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  controllerDispatcher(authSelfInfo)
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
  authLogout
);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/reset-password',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ResetPasswordDataSchema),
  authResetPassword
);

router.post(
  '/v1/auth/change-password',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ChangePasswordDataSchema),
  controllerDispatcher(authChangePassword)
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
