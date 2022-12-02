// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();
const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

interface Course {
  id: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

interface TeacherCourses {
  current: Array<Course>,
  previous: Array<Course>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function teacherCourses(userId: number): Promise<TeacherCourses> {
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
      }
    ]
  };
}

app.use(cors({
  origin: 'http://localhost:3005'
}));

app.get('/v1/user/courses', async (req: Request, res: Response) => {
  try {
    const courses: TeacherCourses = await teacherCourses(0);
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
});

app.get('*', (req: Request, res: Response) => {
  res.send(`Hello ${req.path}`);
});

app.listen(port, () => {
  console.log(`Hello server, running on port ${port}`);
});
