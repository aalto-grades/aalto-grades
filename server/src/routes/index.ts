// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response, Router } from 'express';
import { getUserCourses } from '../controllers/user';

export const router: Router = Router();

router.get('/user/:userId/courses', getUserCourses);

router.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});
