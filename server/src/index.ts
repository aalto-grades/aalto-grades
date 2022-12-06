// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Application, Request, Response } from 'express';
import { validateLogin, performSignup, PlainPassword, UserRole } from './auth';
import cors from 'cors';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

interface LoginRequest {
  username: string,
  password: PlainPassword,
}

interface SignupRequest {
  username: string,
  password: PlainPassword,
  email: string,
  role: UserRole,
}

const validateUserRole = (role: any): role is UserRole => typeof role === 'string' && (
  role === 'Teacher' ||
    role === 'Student' ||
    role === 'Admin'
);

const validateLoginFormat = (body: any): body is LoginRequest =>
  body &&
    body.username &&
    body.password &&
    typeof body.username === 'string' &&
    typeof body.password === 'string';

const validateSignupFormat = (body: any): body is SignupRequest =>
  body &&
    body.username &&
    body.password &&
    body.email &&
    validateUserRole(body.role) &&
    typeof body.username === 'string' &&
    typeof body.password === 'string' &&
    typeof body.email === 'string';

app.use(cors({
  origin: 'http://localhost:3005'
}));

app.post('/v1/auth/login', express.json(), async (req: Request, res: Response) => {
  if (!validateLoginFormat(req.body)) {
    res.status(400);
    return res.send({
      success: false,
      error: 'Invalid login request format',
    });
  }

  try {
    const role = await validateLogin(req.body.username, req.body.password);
    res.send({
      success: true,
      role: role,
    });
  } catch(error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
});

app.post('/v1/auth/signup', express.json(), async (req: Request, res: Response) => {
  if (!validateSignupFormat(req.body)) {
    res.status(400); 
    return res.send({
      success: false,
      error: 'Invalid signup request format',
    });
  }

  try {
    await performSignup(req.body.username, req.body.email, req.body.password, req.body.role);
    res.send({
      success: true
    });
  } catch (error) {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400);
    return res.send({
      success: false,
      error: error,
    });
  }
});

app.post('/v1/auth/signup', express.json(), (req: Request, res: Response) => {
  if (!validateSignupFormat(req.body)) {
    res.status(400); 
    return res.send({
      success: false,
      error: 'Invalid signup request format',
    });
  }

  performSignup(req.body.username, req.body.email, req.body.password, req.body.role).then(() => {
    res.send({
      success: true
    });
  }).catch(error => {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400);
    return res.send({
      success: false,
      error: error,
    });
  });
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log(`Hello server, running on port ${port}`);
});
