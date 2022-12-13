// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import { getAllCourseInstances } from '../controllers/courses';

export const courseRouter: Router = Router();

courseRouter.get('/:courseID/instances', getAllCourseInstances);
