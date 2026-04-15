// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {type RequestHandler, Router} from 'express';
import passport from 'passport';

import {
  ChangeOwnAuthDataSchema,
  ConfirmMfaDataSchema,
  LoginDataSchema,
  PasskeyDeleteOwnDataSchema,
  PasskeyLoginFinishDataSchema,
  PasskeyLoginStartDataSchema,
  PasskeyRegisterFinishDataSchema,
  PasskeyRegisterStartDataSchema,
  ResetAuthDataSchema,
  ResetOwnPasswordDataSchema,
  SystemRole,
} from '@/common/types';
import {
  authLogin,
  authLogout,
  authResetOwnPassword,
  authSamlLogin,
  changeOwnAuth,
  confirmMfa,
  passkeyDeleteOwn,
  passkeyListOwn,
  passkeyLoginFinish,
  passkeyLoginStart,
  passkeyRegisterFinish,
  passkeyRegisterStart,
  resetAuth,
  samlMetadata,
  selfInfo,
} from '../controllers/auth';
import {handleInvalidRequestJson} from '../middleware';
import {jwtAuthentication} from '../middleware/authentication';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {rateLimiterMemoryMiddleware} from '../middleware/rateLimiterMemory';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/auth/self-info',
  jwtAuthentication,
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

router.post('/v1/auth/logout', jwtAuthentication, authLogout);

// Dispatchers not needed, because not async
router.post(
  '/v1/auth/reset-own-password',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ResetOwnPasswordDataSchema),
  rateLimiterMemoryMiddleware,
  authResetOwnPassword
);

router.post(
  '/v1/auth/reset-auth/:userId',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ResetAuthDataSchema),
  controllerDispatcher(resetAuth)
);

router.post(
  '/v1/auth/change-own-auth',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ChangeOwnAuthDataSchema),
  controllerDispatcher(changeOwnAuth)
);

router.post(
  '/v1/auth/confirm-mfa',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ConfirmMfaDataSchema),
  controllerDispatcher(confirmMfa)
);

router.post(
  '/v1/auth/passkey/login/start',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PasskeyLoginStartDataSchema),
  controllerDispatcher(passkeyLoginStart)
);

router.post(
  '/v1/auth/passkey/login/finish',
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PasskeyLoginFinishDataSchema),
  controllerDispatcher(passkeyLoginFinish)
);

router.post(
  '/v1/auth/passkey/register/start',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PasskeyRegisterStartDataSchema),
  controllerDispatcher(passkeyRegisterStart)
);

router.post(
  '/v1/auth/passkey/register/finish',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PasskeyRegisterFinishDataSchema),
  controllerDispatcher(passkeyRegisterFinish)
);

router.get(
  '/v1/auth/passkey/list-own',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  controllerDispatcher(passkeyListOwn)
);

router.post(
  '/v1/auth/passkey/delete-own',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PasskeyDeleteOwnDataSchema),
  controllerDispatcher(passkeyDeleteOwn)
);

router.get(
  '/v1/auth/login-idp',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true,
    session: false,
  }) as RequestHandler,
  (_req, res) => res.redirect('/')
);

router.post(
  '/v1/auth/login-idp/callback',
  express.urlencoded({extended: false}),
  authSamlLogin,
  (_req, res) => res.redirect('/') // TODO: Redirect to frontend URL
);

router.get('/v1/auth/saml/metadata', controllerDispatcher(samlMetadata));
