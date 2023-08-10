// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentGradeData, FinalGrade, GradeOption, HttpCode, Status
} from 'aalto-grades-common/types';
import * as fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import supertest from 'supertest';

import AttainmentGrade from '../../src/database/models/attainmentGrade';
import TeacherInCharge from '../../src/database/models/teacherInCharge';
import User from '../../src/database/models/user';

import { mockTeacher } from '../mock-data/misc';
import { app } from '../../src/app';
import { getCookies, Cookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let res: supertest.Response;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

const studentNumbers: Array<string> = [
  '117486', '114732', '472886', '335462', '874623', '345752', '353418',
  '986957', '611238', '691296', '271778', '344644', '954954'
];

beforeAll(async () => {
  cookies = await getCookies();
});

function checkErrorRes(errorMessages: Array<string>, errorCode: HttpCode): void {
  errorMessages.forEach((error: string) => expect(res.body.errors).toContain(error));
  expect(res.body.data).not.toBeDefined();
  expect(res.statusCode).toBe(errorCode);
}

function checkSuccessRes(res: supertest.Response): void {
  expect(res.body.data).toBeDefined();
  expect(res.body.errors).not.toBeDefined();
  expect(res.statusCode).toBe(HttpCode.Ok);
}

// Function to check that the expected number of grades exist for a user for
// a specific attainment, including checking the numeric values of those grades.
async function checkGradeAmount(
  userId: number,
  attainmentId: number,
  expectedAmount: number,
  expectedGrades: Array<number>
): Promise<void> {
  const attainmentGrades: Array<AttainmentGrade> =
    await AttainmentGrade.findAll({
      where: {
        userId: userId,
        attainmentId: attainmentId
      }
    });

  expect(attainmentGrades.length).toEqual(expectedAmount);

  const grades: Array<number> = attainmentGrades.map(
    (attainmentGrade: AttainmentGrade) => attainmentGrade.grade
  );

  for (const expectedGrade of expectedGrades) {
    expect(grades).toContain(expectedGrade);
  }
}

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv'
  + ' - get grading CSV template',
  () => {

    it('should get correct CSV template when attainments exist (admin user)', async () => {
      res = await request
        .get('/v1/courses/6/assessment-models/15/grades/csv')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(
        'StudentNumber,name216,name217,name218,name219,name220\n'
      );

      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="course_MS-A0102_grading_template.csv"'
      );
    });

    it(
      'should get correct CSV template when attainments exist (teacher in charge)',
      async () => {
        jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

        res = await request
          .get('/v1/courses/6/assessment-models/15/grades/csv')
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(
          'StudentNumber,name216,name217,name218,name219,name220\n'
        );

        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="course_MS-A0102_grading_template.csv"'
        );
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/6/assessment-models/15/grades/csv')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/6/assessment-models/15/grades/csv')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it(
      'should respond with 404 not found if the assessment model has no attainments',
      async () => {
        res = await request
          .get('/v1/courses/6/assessment-models/23/grades/csv')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes(
          ['no attainments found for assessment model with ID 23, '
            + 'add attainments to the assessment model to generate a template'],
          HttpCode.NotFound
        );
      }
    );
  }
);

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv/sisu' +
  ' - export Sisu compatible grading in CSV',
  () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation((): number => {
        return new Date('2023-06-21').valueOf();
      });

    it('should export CSV succesfully when course results are found (admin user)', async () => {
      res = await request
        .get(
          '/v1/courses/6/assessment-models/24/grades/csv/sisu'
          + `?studentNumbers=${JSON.stringify(studentNumbers)}`
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,1,5,21.6.2023,sv,
114732,5,5,21.6.2023,sv,
472886,3,5,21.6.2023,sv,
335462,1,5,21.6.2023,sv,
874623,2,5,21.6.2023,sv,
345752,1,5,21.6.2023,sv,
353418,4,5,21.6.2023,sv,
986957,0,5,21.6.2023,sv,
611238,4,5,21.6.2023,sv,
691296,1,5,21.6.2023,sv,
271778,0,5,21.6.2023,sv,
344644,1,5,21.6.2023,sv,
954954,5,5,21.6.2023,sv,
`);
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="final_grades_course_MS-A0102_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
      );
    });

    it(
      'should export CSV succesfully when course results are found (teacher in charge)',
      async () => {
        jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

        res = await request
          .get('/v1/courses/6/assessment-models/24/grades/csv/sisu' +
          `?studentNumbers=${JSON.stringify(studentNumbers)}`)
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,1,5,21.6.2023,sv,
114732,5,5,21.6.2023,sv,
472886,3,5,21.6.2023,sv,
335462,1,5,21.6.2023,sv,
874623,2,5,21.6.2023,sv,
345752,1,5,21.6.2023,sv,
353418,4,5,21.6.2023,sv,
986957,0,5,21.6.2023,sv,
611238,4,5,21.6.2023,sv,
691296,1,5,21.6.2023,sv,
271778,0,5,21.6.2023,sv,
344644,1,5,21.6.2023,sv,
954954,5,5,21.6.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_MS-A0102_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it('should export the best grade if multiple ones exist', async () => {
      // Check that multiple grades exist as expected
      await checkGradeAmount(1, 283, 3, [0, 3, 5]);
      await checkGradeAmount(2, 283, 2, [1, 2]);
      await checkGradeAmount(3, 283, 1, [4]);

      res = await request
        .get(
          '/v1/courses/2/assessment-models/50/grades/csv/sisu'
          + `?studentNumbers=${JSON.stringify(['352772', '476617', '344625'])}`
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
352772,5,5,21.6.2023,en,
476617,2,5,21.6.2023,en,
344625,4,5,21.6.2023,en,
`);
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="final_grades_course_CS-A1120_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
      );
    });

    it('should export CSV succesfully with custom assessmentDate',
      async () => {
        res = await request
          .get(
            '/v1/courses/6/assessment-models/24/grades/csv/sisu'
            + '?assessmentDate=2023-05-12'
            + `&studentNumbers=${JSON.stringify(studentNumbers)}`
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,1,5,12.5.2023,sv,
114732,5,5,12.5.2023,sv,
472886,3,5,12.5.2023,sv,
335462,1,5,12.5.2023,sv,
874623,2,5,12.5.2023,sv,
345752,1,5,12.5.2023,sv,
353418,4,5,12.5.2023,sv,
986957,0,5,12.5.2023,sv,
611238,4,5,12.5.2023,sv,
691296,1,5,12.5.2023,sv,
271778,0,5,12.5.2023,sv,
344644,1,5,12.5.2023,sv,
954954,5,5,12.5.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_MS-A0102_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it('should filter CSV grades based on instance ID if URL query included',
      async () => {
        res = await request
          .get(
            '/v1/courses/9/assessment-models/42/grades/csv/sisu'
            + '?assessmentDate=2023-12-12&instanceId=26'
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
327976,5,5,12.12.2023,sv,
478988,5,5,12.12.2023,sv,
139131,5,5,12.12.2023,sv,
857119,5,5,12.12.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_PHYS-A1140_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it('should filter CSV grades based on student numbers if URL query included',
      async () => {
        res = await request
          .get(
            '/v1/courses/10/assessment-models/42/grades/csv/sisu'
            + '?assessmentDate=2023-12-12&studentNumbers=["114732","472886","327976","139131"]'
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
114732,5,5,12.12.2023,fi,
472886,5,5,12.12.2023,fi,
327976,5,5,12.12.2023,fi,
139131,5,5,12.12.2023,fi,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_PHYS-A1140_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it('should filter CSV grades based on instance ID and student number if URL query included',
      async () => {
        res = await request
          .get(
            '/v1/courses/9/assessment-models/42/grades/csv/sisu'
            + '?assessmentDate=2023-12-12&instanceId=26' +
            '&studentNumbers=["327976","139131"]'
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
327976,5,5,12.12.2023,sv,
139131,5,5,12.12.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_PHYS-A1140_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it('should return results for all instaces connected to the assessment model if no filters',
      async () => {
        res = await request
          .get(
            '/v1/courses/9/assessment-models/42/grades/csv/sisu?assessmentDate=2023-12-12'
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,5,5,12.12.2023,sv,
114732,5,5,12.12.2023,sv,
472886,5,5,12.12.2023,sv,
335462,5,5,12.12.2023,sv,
874623,5,5,12.12.2023,sv,
345752,5,5,12.12.2023,sv,
353418,5,5,12.12.2023,sv,
986957,5,5,12.12.2023,sv,
611238,5,5,12.12.2023,sv,
691296,5,5,12.12.2023,sv,
271778,5,5,12.12.2023,sv,
344644,5,5,12.12.2023,sv,
954954,5,5,12.12.2023,sv,
327976,5,5,12.12.2023,sv,
478988,5,5,12.12.2023,sv,
139131,5,5,12.12.2023,sv,
857119,5,5,12.12.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_PHYS-A1140_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it(
      'should respond with 400 bad request, if (optional) assessmentDate param is not valid date',
      async () => {
        res = await request
          .get('/v1/courses/1/assessment-models/1/grades/csv/sisu?assessmentDate=notValidDate')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'assessmentDate must be a `date` type, but the final value was:' +
          ' `Invalid Date` (cast from the value `"notValidDate"`).'
        ], HttpCode.BadRequest);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request.get('/v1/courses/1/assessment-models/1/grades/csv/sisu')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      res = await request
        .get('/v1/courses/1/assessment-models/1/grades/csv/sisu')
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if grades have not been calculated yet', async () => {
      res = await request
        .get('/v1/courses/2/assessment-models/2/grades/csv/sisu')
        .set('Cookie', cookies.adminCookie);

      checkErrorRes(
        [
          'no grades found, make sure grades have been' +
          ' uploaded/calculated before requesting course results'
        ],
        HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      res = await request
        .get(`/v1/courses/${badId}/assessment-models/1/grades/csv/sisu`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if assessment model does not exist', async () => {
      res = await request
        .get(`/v1/courses/1/assessment-models/${badId}/grades/csv/sisu`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`assessment model with ID ${badId} not found`], HttpCode.NotFound);
    });

    it(
      'should respond with 409 conflict, if assessment model does not belong to the course',
      async () => {
        res = await request
          .get('/v1/courses/1/assessment-models/2/grades/csv/sisu')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes(
          ['assessment model with ID 2 does not belong to the course with ID 1'],
          HttpCode.Conflict
        );
      });

  });

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/grades'
  + ' - get final grades in JSON', () => {

    function checkFinalGradesStructure(finalGrades: Array<FinalGrade>): void {
      for (const finalGrade of finalGrades) {
        expect(finalGrade.userId).toBeDefined();
        expect(finalGrade.studentNumber).toBeDefined();
        expect(finalGrade.credits).toBeDefined();
        expect(finalGrade.grades).toBeDefined();

        for (const option of finalGrade.grades) {
          expect(option.gradeId).toBeDefined();
          expect(option.graderId).toBeDefined();
          expect(option.grade).toBeDefined();
          expect(option.status).toBeDefined();
          expect(option.manual).toBeDefined();
          expect(option.date).toBeDefined();
          expect(option.expiryDate).not.toBeDefined();
        }
      }
    }

    function checkStudentNumbers(
      finalGrades: Array<FinalGrade>, studentNumbers: Array<string>
    ): void {
      expect(
        finalGrades.map((finalGrade: FinalGrade) => finalGrade.studentNumber).sort()
      ).toEqual(studentNumbers.sort());
    }


    it(
      'should get final grades succesfully when course results are found (admin user)',
      async () => {
        res = await request
          .get(
            '/v1/courses/6/assessment-models/24/grades'
          + `?studentNumbers=${JSON.stringify(studentNumbers)}`
          )
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
      }
    );

    it(
      'should get final grades succesfully when course results are found (teacher in charge)',
      async () => {
        jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

        res = await request
          .get('/v1/courses/6/assessment-models/24/grades' +
          `?studentNumbers=${JSON.stringify(studentNumbers)}`)
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'application/json');

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
      }
    );

    it(
      'should get the appropriate number of grade options depending on how many grades exist',
      async () => {
        res = await request
          .get('/v1/courses/2/assessment-models/50/grades')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        function checkGradesOfStudent(
          studentNumber: string,
          expectedGrades: Array<{
            grade: number,
            status: Status
          }>
        ): void {

          const gradesOfStudent: Array<{ grade: number, status: Status }> | undefined =
            res.body.data.find((finalGrade: FinalGrade) => {
              return finalGrade.studentNumber === studentNumber;
            })?.grades.map((option: GradeOption) => {
              return {
                grade: option.grade,
                status: option.status
              };
            });

          expect(gradesOfStudent).toBeDefined();
          for (const expectedGrade of expectedGrades) {
            expect(gradesOfStudent).toContainEqual(expectedGrade);
          }
        }

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
        checkStudentNumbers(res.body.data, ['352772', '476617', '344625']);
        checkGradesOfStudent('352772', [
          { grade: 0, status: Status.Fail },
          { grade: 3, status: Status.Fail },
          { grade: 5, status: Status.Pass }
        ]);
        checkGradesOfStudent('476617', [
          { grade: 1, status: Status.Fail },
          { grade: 2, status: Status.Fail }
        ]);
        checkGradesOfStudent('344625', [
          { grade: 4, status: Status.Pass },
        ]);
      }
    );

    it('should filter returned grades based on student number if URL query included',
      async () => {
        res = await request
          .get('/v1/courses/9/assessment-models/41/grades' +
          '?studentNumbers=["869364","711199","795451"]')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
        checkStudentNumbers(res.body.data, ['869364', '711199', '795451']);
      });

    it('should filter returned grades based on instance ID if URL query included',
      async () => {
        res = await request
          .get('/v1/courses/9/assessment-models/42/grades?instanceId=26')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
        checkStudentNumbers(res.body.data, [
          '327976', '478988', '139131', '857119'
        ]);
      });

    // TODO: Clarify whether this is supposed to be a union or intersection
    it(
      'should filter returned grades based on instance ID and student number if URL query included',
      async () => {
        res = await request
          .get('/v1/courses/9/assessment-models/42/grades?instanceId=26' +
          '&studentNumbers=["327976","139131"]')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
        checkStudentNumbers(res.body.data, ['327976', '139131']);
      });

    it('should not filter returned grades if no filters included in URL query',
      async () => {
        res = await request
          .get('/v1/courses/9/assessment-models/42/grades')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        checkSuccessRes(res);
        checkFinalGradesStructure(res.body.data);
        checkStudentNumbers(res.body.data, [
          '658593', '451288', '167155', '117486', '114732', '472886', '335462',
          '874623', '345752', '353418', '986957', '611238', '691296', '271778',
          '344644', '954954', '327976', '478988', '139131', '857119'
        ]);
      });

    it(
      'should respond with 400 bad request, if course or instance ID not is valid', async () => {
        res = await request
          .get(`/v1/courses/${badInput}/assessment-models/1/grades`)
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'id must be a `number` type, but the final value was:' +
          ' `NaN` (cast from the value `"notValid"`).'], HttpCode.BadRequest);

        res = await request
          .get(`/v1/courses/1/assessment-models/${badInput}/grades`)
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'id must be a `number` type, but the final value was:' +
            ' `NaN` (cast from the value `"notValid"`).'], HttpCode.BadRequest);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request.get('/v1/courses/1/assessment-models/1/grades')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      res = await request
        .get('/v1/courses/6/assessment-models/24/grades')
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if grades have not been calculated yet', async () => {
      res = await request
        .get('/v1/courses/2/assessment-models/2/grades')
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.NotFound);

      checkErrorRes(
        [
          'no grades found, make sure grades have been' +
          ' uploaded/calculated before requesting course results'
        ],
        HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      res = await request
        .get(`/v1/courses/${badId}/assessment-models/1/grades`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if assessment model does not exist', async () => {
      res = await request
        .get(`/v1/courses/1/assessment-models/${badId}/grades`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`assessment model with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 409 conflict, if instance does not belong to the course', async () => {
      res = await request
        .get('/v1/courses/1/assessment-models/2/grades')
        .set('Cookie', cookies.adminCookie);

      checkErrorRes(
        ['assessment model with ID 2 does not belong to the course with ID 1'],
        HttpCode.Conflict
      );
    });

  }
);

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/user/:userId'
  + ' - get attainment grading for user based on ID',
  () => {

    function checkBodyStructure(data: AttainmentGradeData): void {
      expect(data.attainmentId).toBeDefined();
      expect(data.attainmentName).toBeDefined();
      expect(data.grades).toBeDefined();
      expect(data.subAttainments).toBeDefined();

      data.grades.forEach((option: GradeOption) => {
        expect(option.gradeId).toBeDefined();
        expect(option.graderId).toBeDefined();
        expect(option.grade).toBeDefined();
        expect(option.status).toBeDefined();
        expect(option.manual).toBeDefined();
        expect(option.date).toBeDefined();
        expect(option.expiryDate).toBeDefined();
      });

      data.subAttainments?.forEach((sub: AttainmentGradeData) => {
        checkBodyStructure(sub);
      });
    }

    it('should get correct user grades for assessment model (admin user)', async () => {
      res = await request
        .get('/v1/courses/4/assessment-models/7/grades/user/25')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);
      checkSuccessRes(res);
      checkBodyStructure(res.body.data);
    });

    it('should get correct user grades for assessment model (teacher in charge)', async () => {
      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      res = await request
        .get('/v1/courses/4/assessment-models/7/grades/user/25')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);
      checkSuccessRes(res);
      checkBodyStructure(res.body.data);
    });

    it('should get a single grade for an attainment if only one grade exists', async () => {
      res = await request
        .get('/v1/courses/2/assessment-models/46/grades/user/1')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);
      checkSuccessRes(res);
      checkBodyStructure(res.body.data);

      expect(res.body.data.grades.length).toEqual(1);
    });

    it('should get multiple grades for an attainment if multiple grades exist', async () => {
      res = await request
        .get('/v1/courses/2/assessment-models/47/grades/user/1')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);
      checkSuccessRes(res);
      checkBodyStructure(res.body.data);

      expect(res.body.data.grades.length).toEqual(3);
    });

    it('should get an empty grade array if no grades exist for an attainment', async () => {
      res = await request
        .get('/v1/courses/2/assessment-models/48/grades/user/1')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);
      checkSuccessRes(res);
      checkBodyStructure(res.body.data);

      expect(res.body.data.grades.length).toEqual(0);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/4/assessment-models/7/grades/user/25')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/4/assessment-models/7/grades/user/25')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });
  }
);

describe(
  'Test POST /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv'
  + ' - import grading data from CSV',
  () => {

    it('should process CSV succesfully when attainments and users exist (admin user)', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/assessment-models/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it(
      'should process CSV succesfully when attainments and users exist (teacher in charge)',
      async () => {
        jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data).toBeDefined();
      });

    it('should create users when a user does not exist in database', async () => {
      let users: Array<User> = await User.findAll({
        where: {
          studentNumber: {
            [Op.in]: ['987654', '998877']
          }
        }
      });

      expect(users.length).toBe(0);
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_non-existing_students.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/assessment-models/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      users = await User.findAll({
        where: {
          studentNumber: {
            [Op.in]: ['987654', '998877']
          }
        }
      });

      expect(users.length).toBe(2);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should mark attainment grades as manual', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_one.csv'), 'utf8'
      );

      res = await request
        .post('/v1/courses/5/assessment-models/14/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const userAttainment: AttainmentGrade = await AttainmentGrade.findOne({
        where: {
          userId: 4,
          attainmentId: 224
        }
      }) as AttainmentGrade;

      expect(userAttainment).not.toBeNull;
      expect(userAttainment.manual).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should mark correct grader ID', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_one_2.csv'), 'utf8'
      );

      res = await request
        .post('/v1/courses/5/assessment-models/14/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const userAttainment: AttainmentGrade = await AttainmentGrade.findOne({
        where: {
          userId: 4,
          attainmentId: 225
        }
      }) as AttainmentGrade;

      const selfInfo: supertest.Response = await request
        .get('/v1/auth/self-info')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(userAttainment.graderId).toBe(selfInfo.body.data.id);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    async function checkStatusOfGrade(
      userId: number,
      attainmentId: number,
      expectedGrade: number,
      expectedStatus: Status
    ): Promise<void> {
      const attainmentGrade: AttainmentGrade = await AttainmentGrade.findOne({
        where: {
          userId: userId,
          attainmentId: attainmentId
        }
      }) as AttainmentGrade;

      expect(attainmentGrade.grade).toBe(expectedGrade);
      expect(attainmentGrade.status).toBe(expectedStatus);
    }

    it(
      'should determine whether manual attainment was passed based on min required grade',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_failing_manual.csv'), 'utf8'
        );

        res = await request
          .post('/v1/courses/2/assessment-models/51/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        await checkStatusOfGrade(5, 285, 1, Status.Fail);
        await checkStatusOfGrade(6, 285, 1.9, Status.Fail);
        await checkStatusOfGrade(7, 285, 2, Status.Pass);
        await checkStatusOfGrade(8, 285, 3, Status.Pass);
      }
    );

    it(
      'should determine whether non-manual attainment was passed based on min required grade',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_failing_non_manual.csv'), 'utf8'
        );

        res = await request
          .post('/v1/courses/2/assessment-models/51/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        await checkStatusOfGrade(1, 284, 1, Status.Fail);
        await checkStatusOfGrade(2, 284, 2, Status.Fail);
        await checkStatusOfGrade(3, 284, 3, Status.Pass);
        await checkStatusOfGrade(4, 284, 3.4, Status.Pass);
      }
    );

    it(
      'should allow uploading multiple grades to the same attainment for a student',
      async () => {
        async function uploadGrade(n: 1 | 2): Promise<void> {
          await request
            .post('/v1/courses/5/assessment-models/14/grades/csv')
            .attach(
              'csv_data',
              fs.createReadStream(
                path.resolve(
                  __dirname, `../mock-data/csv/grades_multiple_uploads_${n}.csv`
                ),
                'utf8'
              ),
              { contentType: 'text/csv' }
            )
            .set('Cookie', cookies.adminCookie)
            .set('Accept', 'application/json')
            .expect(HttpCode.Ok);
        }

        await uploadGrade(1);
        let grades: Array<AttainmentGrade> = await AttainmentGrade.findAll({
          where: {
            userId: 28,
            attainmentId: 268
          }
        });
        expect(grades.length).toEqual(1);
        expect(grades[0].grade).toEqual(1);

        await uploadGrade(2);
        grades = await AttainmentGrade.findAll({
          where: {
            userId: 28,
            attainmentId: 268
          }
        });
        expect(grades.length).toEqual(2);
        expect(grades.find((val: AttainmentGrade) => val.grade === 1)).toBeDefined();
        expect(grades.find((val: AttainmentGrade) => val.grade === 5)).toBeDefined();
      }
    );

    it('should process big CSV succesfully (1100 x 178 = 195 800 individual attainment grades)',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_big.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/6/assessment-models/9/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data).toBeDefined();
      }, 40000);

    it(
      'should respond with 400 bad request, if the CSV has only student numbers, no grading data',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_only_student_numbers.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          ['No attainments found from the header, please upload valid CSV.'], HttpCode.BadRequest
        );
      });

    it('should respond with 400 bad request, if the CSV file header parsing fails',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_incorrect_header_columns.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        function errorMessage(column: number, name: string, instanceId: number): string {
          return `Header attainment data parsing failed at column ${column}. `
            + `Could not find an attainment with name ${name} in `
            + `assessment model with ID ${instanceId}.`;
        }

        const expectedErrors: Array<string> = [
          errorMessage(2, 'first-fake', 1),
          errorMessage(3, 'name2', 1),
          errorMessage(4, 'second-fake;', 1),
          errorMessage(6, 'third-fake', 1)
        ];
        checkErrorRes(expectedErrors, HttpCode.BadRequest);
      }
    );

    it('should respond with 400 bad request, if the CSV file grading data parsing fails',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_incorrect_grade_rows.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        const expectedErrors: Array<string> = [
          'CSV file row 3 column 5 expected number, received "7r"',
          'CSV file row 5 column 2 expected number, received "xx"',
          'CSV file row 6 column 4 expected number, received "err"'
        ];
        checkErrorRes(expectedErrors, HttpCode.BadRequest);
      }
    );

    it(
      'should respond with 400 bad request, if the CSV file parsing fails (one row invalid length)',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_invalid_row.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['Invalid Record Length: expect 7, got 6 on line 4'], HttpCode.BadRequest);
      }
    );

    it(
      'should respond with 400 bad request, if the CSV file field name not "csv_data"',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach(badInput, csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          ['Unexpected field. To upload CSV file, set input field name as "csv_data"'],
          HttpCode.BadRequest
        );
      }
    );

    it('should respond with 400 bad request, if the file content-type not text/csv',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', csvData, { contentType: 'application/json' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
      }
    );

    it('should respond with 400 bad request, if the file extension incorrect (.txt)',
      async () => {
        const txtFile: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/wrong_file_type.txt'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', txtFile, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
      }
    );

    it('should respond with 400 bad request, if the CSV file not found in the request.',
      async () => {
        res = await request
          .post('/v1/courses/1/assessment-models/1/grades/csv')
          .attach('csv_data', false, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          [
            'CSV file not found in the request. To upload CSV file,' +
          ' set input field name as "csv_data"'
          ],
          HttpCode.BadRequest
        );
      });

    it('should respond with 400 bad request, if validation fails (non-number course id)',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post(`/v1/courses/${badInput}/assessment-models/1/grades/csv`)
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          [
            'id must be a `number` type, but the final value was:' +
            // eslint-disable-next-line no-useless-escape
            ' `NaN` (cast from the value `\"notValid\"`).'
          ],
          HttpCode.BadRequest
        );
      });

    it('should respond with 400 bad request, if validation fails (non-number assessment model id)',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post(`/v1/courses/1/assessment-models/${badInput}/grades/csv`)
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          [
            'id must be a `number` type, but the final value was:' +
            // eslint-disable-next-line no-useless-escape
            ' `NaN` (cast from the value `\"notValid\"`).'
          ],
          HttpCode.BadRequest
        );
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      await request
        .post('/v1/courses/1/assessment-models/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/assessment-models/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/${badId}/assessment-models/1/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if assessment model does not exist', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/1/assessment-models/${badId}/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`assessment model with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 409 conflict, if instance does not belong to the course', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/assessment-models/2/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes(
        ['assessment model with ID 2 does not belong to the course with ID 1'],
        HttpCode.Conflict
      );
    });
  }
);

describe(
  'Test POST /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
  () => {
    async function checkGraderId(result: AttainmentGrade, cookie: Array<string>): Promise<void> {
      const selfInfo: supertest.Response = await request
        .get('/v1/auth/self-info')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(result.graderId).toBe(selfInfo.body.data.id);
      expect(result.userId).not.toBe(selfInfo.body.data.id);
    }

    async function checkGrade(
      attainmentId: number,
      userId: number,
      grade: number,
      cookie: Array<string>,
      checkGrader: boolean = true
    ): Promise<void> {
      const result: AttainmentGrade | null = await AttainmentGrade.findOne({
        where: {
          attainmentId: attainmentId,
          userId: userId
        }
      });

      expect(result).not.toBe(null);
      expect(result?.grade).toBe(grade);
      if (checkGrader)
        checkGraderId(result as AttainmentGrade, cookie);
    }

    it('should calculate correct grade, numeric grade (admin user)', async () => {
      checkSuccessRes(await request
        .post('/v1/courses/1/assessment-models/25/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .set('Cookie', cookies.adminCookie));

      checkGrade(228, 391, 1.25, cookies.adminCookie);
    });

    it('should calculate correct grade, numeric grade (teacher in charge)', async () => {
      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      checkSuccessRes(await request
        .post('/v1/courses/1/assessment-models/25/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .set('Cookie', cookies.userCookie));

      checkGrade(228, 391, 1.25, cookies.userCookie, false);
    });

    it('should calculate multiple correct grades based on student numbers', async () => {
      checkSuccessRes(await request
        .post('/v1/courses/1/assessment-models/26/grades/calculate')
        .send({
          studentNumbers: ['238447', '197232', '265136']
        })
        .set('Cookie', cookies.adminCookie));

      checkGrade(231, 391, 1.5, cookies.adminCookie);
      checkGrade(231, 392, 4.75, cookies.adminCookie);
      checkGrade(231, 393, 3.25, cookies.adminCookie);
    });

    it('should calculate correct grades in higher depths based on student numbers', async () => {
      checkSuccessRes(await request
        .post('/v1/courses/1/assessment-models/27/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .set('Cookie', cookies.adminCookie));

      checkGrade(234, 391, 3.12, cookies.adminCookie);
    });

    it('should calculate multiple grades for the same attainment on repeated runs', async () => {
      await checkGradeAmount(391, 275, 0, []);
      await checkGradeAmount(391, 277, 0, []);
      await checkGradeAmount(391, 280, 0, []);

      checkSuccessRes(
        await request
          .post('/v1/courses/2/assessment-models/49/grades/calculate')
          .send({
            studentNumbers: ['238447']
          })
          .set('Cookie', cookies.adminCookie)
      );

      await checkGradeAmount(391, 275, 1, [3.12]);
      await checkGradeAmount(391, 277, 1, [3.2]);
      await checkGradeAmount(391, 280, 1, [3]);

      await AttainmentGrade.create({
        userId: 391,
        attainmentId: 278,
        graderId: 1,
        grade: 10,
        manual: true,
        status: Status.Pass
      });

      checkSuccessRes(
        await request
          .post('/v1/courses/2/assessment-models/49/grades/calculate')
          .send({
            studentNumbers: ['238447']
          })
          .set('Cookie', cookies.adminCookie)
      );

      await checkGradeAmount(391, 275, 2, [3.12, 3.4800000000000004]);
      await checkGradeAmount(391, 277, 2, [3.2, 3.8000000000000003]);
      await checkGradeAmount(391, 280, 2, [3, 3]);
    });

    it('should allow manually overriding a student\'s grade', async () => {
      checkSuccessRes(await request
        .post('/v1/courses/1/assessment-models/28/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .set('Cookie', cookies.adminCookie));

      checkGrade(242, 391, 5, cookies.adminCookie, false);
    });

    it(
      'should calculate multiple correct grades based on instance ID and student numbers',
      async () => {
        checkSuccessRes(await request
          .post('/v1/courses/9/assessment-models/42/grades/calculate')
          .send({
            instanceId: 27,
            studentNumbers: ['658593', '451288']
          })
          .set('Cookie', cookies.adminCookie));

        checkGrade(256, 1241, 5, cookies.adminCookie);
        checkGrade(256, 1242, 5, cookies.adminCookie);
      });

    it('should calculate multiple correct grades based on instance ID', async () => {
      checkSuccessRes(await request
        .post('/v1/courses/9/assessment-models/42/grades/calculate')
        .send({
          instanceId: 27
        })
        .set('Cookie', cookies.adminCookie));

      checkGrade(256, 1241, 5, cookies.adminCookie);
      checkGrade(256, 1242, 5, cookies.adminCookie);
      checkGrade(256, 1243, 5, cookies.adminCookie);
    });

    it('should consider the best manual grades when multiple options exist', async () => {
      // Check that multiple grades exist as expected
      expect((await AttainmentGrade.findAll({
        where: {
          userId: 1,
          attainmentId: 270
        }
      })).length).toBe(2);

      expect((await AttainmentGrade.findAll({
        where: {
          userId: 1,
          attainmentId: 271
        }
      })).length).toBe(3);

      checkSuccessRes(await request
        .post('/v1/courses/2/assessment-models/45/grades/calculate')
        .send({
          studentNumbers: ['352772']
        })
        .set('Cookie', cookies.adminCookie)
      );

      checkGrade(269, 1, 5, cookies.adminCookie);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .post('/v1/courses/1/assessment-models/1/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      res = await request
        .post('/v1/courses/1/assessment-models/1/grades/calculate')
        .send({
          studentNumbers: ['238447']
        })
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it(
      'should respond with 404 not found if instance does not have any students assigned',
      async () => {
        res = await request
          .post('/v1/courses/9/assessment-models/42/grades/calculate')
          .send({
            instanceId: 28
          })
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.NotFound);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe('No student numbers found from instance ID 28');
      });
  }
);

describe(
  'Test PUT /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/:gradeId'
  + ' - edit user attainment grade data',
  () => {

    it('should edit user attainment grade data (admin user)', async () => {
      res = await request
        .put('/v1/courses/5/assessment-models/8/grades/1')
        .send({
          grade: 5,
          status: 'PASS',
          date: '2022-12-24',
          expiryDate: '2023-12-24',
          comment: 'testing'
        })
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.Ok);

      checkSuccessRes(res);
    });

    it('should edit user attainment grade data (teacher in charge)', async () => {
      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      res = await request
        .put('/v1/courses/5/assessment-models/8/grades/1')
        .send({
          grade: 5,
          status: 'PASS',
          date: '2022-12-24',
          expiryDate: '2023-12-24',
          comment: 'testing'
        })
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Ok);

      checkSuccessRes(res);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .put('/v1/courses/1/assessment-models/1/grades/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const res: supertest.Response = await request
        .put('/v1/courses/1/assessment-models/1/grades/1')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if grade does not exist', async () => {
      res = await request
        .put(`/v1/courses/1/assessment-models/1/grades/${badId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`attainment grade with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      res = await request
        .put(`/v1/courses/${badId}/assessment-models/1/grades/1`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if assessment model does not exist', async () => {
      res = await request
        .put(`/v1/courses/1/assessment-models/${badId}/grades/1`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`assessment model with ID ${badId} not found`], HttpCode.NotFound);
    });

    it(
      'should respond with 409 conflict, if assessment model does not belong to the course',
      async () => {
        res = await request
          .put('/v1/courses/1/assessment-models/2/grades/1')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          ['assessment model with ID 2 does not belong to the course with ID 1'],
          HttpCode.Conflict
        );
      });
  }
);
