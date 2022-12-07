// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { TeacherCourses, getTeacherCourses } from '../../services/user';

export async function getUserCourses(req: Request, res: Response): Promise<void> {
  try {
    const userId: number = Number(req.params.userId);
    const courses: TeacherCourses = await getTeacherCourses(userId);
    res.send({
      success: true,
      courses: courses,
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
}
