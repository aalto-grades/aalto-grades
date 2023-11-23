// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import passport from 'passport';

import {
  authLogin,
  authLogout,
  authSamlLogin,
  authSelfInfo,
  authSignup,
} from '../controllers/auth';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  controllerDispatcher(authSelfInfo)
);

router.post('/v1/auth/login', express.json(), controllerDispatcher(authLogin));

router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  controllerDispatcher(authLogout)
);

router.post(
  '/v1/auth/signup',
  express.json(),
  controllerDispatcher(authSignup)
);

router.get(
  '/v1/auth/login-idp',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true,
    session: false
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/v1/auth/login-idp/callback', controllerDispatcher(authSamlLogin));
