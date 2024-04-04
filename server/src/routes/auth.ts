// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import bodyParser from 'body-parser';
import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';

import {SignupRequestSchema} from '@common/types';
import {processRequestBody} from 'zod-express-middleware';
import {NODE_ENV} from '../configs/environment';
import {
  authLogin,
  authLogout,
  authSamlLogin,
  authSelfInfo,
  authSignup,
  samlMetadata,
} from '../controllers/auth';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';
import {requestSyslogger} from '../middleware/requestLogger';

export const router = Router();

if (NODE_ENV !== 'test') {
  // tests timeout for some reason if used
  router.use(requestSyslogger);
}

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  controllerDispatcher(authSelfInfo)
);

// Dispatchers not needed, because not async
router.post('/v1/auth/login', express.json(), authLogin);

router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  authLogout
);

// TODO: Remove route?
router.post(
  '/v1/auth/signup',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(SignupRequestSchema),
  controllerDispatcher(authSignup)
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
