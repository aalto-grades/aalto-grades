// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { Course } from './course';

export interface TeacherCourses {
  current: Array<Course>,
  previous: Array<Course>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTeacherCourses(userId: number): Promise<TeacherCourses> {
  return {
    current: [
      {
        id: 0,
        courseCode: 'CS-E4580',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Computer Science'
        },
        name: {
          fi: '',
          sv: '',
          en: 'Programming Parallel Computers D'
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      }
    ],
    previous: [
      {
        id: 1,
        courseCode: 'ELEC-C7241',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Communications and Networking'
        },
        name: {
          fi: 'Tietokoneverkot',
          sv: '',
          en: ''
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      },
      {
        id: 2,
        courseCode: 'CS-C3120',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Communications and Networking'
        },
        name: {
          fi: '',
          sv: '',
          en: 'Human-Computer Interaction'
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      }
    ]
  };
}

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
