// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {app} from '../../src/app';
import {getDateOfLatestGrade} from '../../src/controllers/utils/grades';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {resetDb} from '../util/resetDb';

let courseId = -1;
let extraStudentId = -1;
const students: {id: number; latestGrade: Date}[] = [];
const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

beforeAll(async () => {
  let courseParts;
  [courseId, courseParts] = await createData.createCourse({});

  const now = new Date();

  // Create 10 students
  for (let i = 0; i < 100; i++) {
    let newestGrade = new Date(1970, 0, 0);
    const gradeDates = [];

    // Create 10 grade dates
    for (let j = 0; j < 10; j++) {
      const gradeDate = randomDate(new Date(2020), now);
      if (gradeDate > newestGrade) newestGrade = gradeDate;
      gradeDates.push(gradeDate);
    }

    const newUserId = (await createData.createUser()).id;
    students.push({
      id: newUserId,
      latestGrade: newestGrade,
    });

    // Create the grades
    for (const gradeDate of gradeDates) {
      const coursePartIndex = Math.floor(Math.random() * courseParts.length);
      await createData.createGrade(
        newUserId,
        courseParts[coursePartIndex].id,
        TEACHER_ID,
        Math.floor(Math.random() * 30),
        gradeDate
      );
    }
  }
  extraStudentId = (await createData.createUser()).id;
});

afterAll(async () => {
  await resetDb();
});

// Fails without this due to the logger being undefined?
supertest(app);

describe('Test latest date finder', () => {
  it('should return the correct date', async () => {
    for (const student of students) {
      // Set date time portion to UTC midnight.
      // Example: 03:00:00 +3:00 / 02:00:00 +2:00
      const gradeDate = new Date(
        Date.UTC(
          student.latestGrade.getFullYear(),
          student.latestGrade.getMonth(),
          student.latestGrade.getDate()
        )
      );

      const resultDate = await getDateOfLatestGrade(student.id, courseId);
      expect(resultDate).toEqual(gradeDate);
    }
  });

  it('should throw an error when no grades exist', async () => {
    await expect(
      getDateOfLatestGrade(extraStudentId, courseId)
    ).rejects.toThrow();
  });
});
