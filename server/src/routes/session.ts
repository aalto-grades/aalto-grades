import express, { Router } from 'express';
import passport from 'passport';

import { authLogin, authLogout, authSelfInfo, authSignup } from '../controllers/auth';

export const router: Router = Router();

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     tags: [Session]
 *     description: Log in as a user
 *     requestBody:
 *       description: The credentials for the user, currently consisting of the email and password.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Credentials'
 *     responses:
 *       200:
 *         description: The login has succeeded, and an access token is return in a cookie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/LoginResult'
 *         headers:
 *            Set-Cookie:
 *              description: 'JWT token, storing an access token to allow using the API'
 *              schema:
 *                type: string
 *                example: jwt=wliuerhlwieurh; Secure; HttpOnly; SameSite=None
 *       401:
 *         description: >
 *           The login has failed, due to invalid credentials or an invalid request format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *
 */
router.post('/v1/auth/login', express.json(), authLogin);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     tags: [Session]
 *     description: >
 *       Log out of a session, removing the session key from the browser.
 *       This requires the user to be already logged in, authenticated via a
 *       JWT token in the cookie.
 *     requestBody:
 *       description: Empty body is sufficient
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The user has successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operationsucceeded
 *       401:
 *         description: The user is not logged in, or the JWT token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/auth/logout',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authLogout
);

/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     tags: [Session]
 *     description: >
 *       Attempts to create a new user with the specified information, for
 *       logging in to the system.
 *     requestBody:
 *       description: Basic user information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/SignupRequest'
 *     responses:
 *       200:
 *         description: The user has been created and logged in
 *         content:
 *           application/json:
 *             schema:
 *               $req: '#/definitions/SignupResult'
 *         headers:
 *           Set-Cookie:
 *             description: 'JWT token, storing an access token to allow using the API'
 *             schema:
 *               type: string
 *               example: jwt=wliuerhlwieurh; Secure; HttpOnly; SameSite=None
 *       409:
 *         description: A user with the specified email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post('/v1/auth/signup', express.json(), authSignup);

/**
 * @swagger
 * /v1/auth/self-info:
 *   get:
 *     tags: [Session]
 *     description: >
 *       Retrieves information about the user that is currently logged in
 *     responses:
 *       200:
 *         description: Information about the user who is logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthSelfInfo'
 *       401:
 *         description: The user is not logged in, or the JWT token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 *
 */
router.get(
  '/v1/auth/self-info',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  authSelfInfo
);
