// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import supertest from 'supertest';

import CourseInstanceRole from '../../src/database/models/courseInstanceRole';
import CourseResult from '../../src/database/models/courseResult';
import User from '../../src/database/models/user';
import UserAttainmentGrade from '../../src/database/models/userAttainmentGrade';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { getCookies, Cookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let res: supertest.Response;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

function checkErrorRes(errorMessages: Array<string>, errorCode: HttpCode): void {
  expect(res.body.success).toBe(false);
  errorMessages.forEach((error: string) => expect(res.body.errors).toContain(error));
  expect(res.body.data).not.toBeDefined();
  expect(res.statusCode).toBe(errorCode);
}

function checkSuccessRes(res: supertest.Response): void {
  expect(res.body.success).toBe(true);
  expect(res.body.data).toBeDefined();
  expect(res.body.errors).not.toBeDefined();
  expect(res.statusCode).toBe(HttpCode.Ok);
}

describe(
  'Test POST /v1/courses/:courseId/instances/:instanceId/grades/csv - import grading data from CSV',
  () => {

    it('should process CSV succesfully when course, course instance and users exist', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it(
      'should create and add users to the course with role STUDENT when user does not exist in db',
      async () => {
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
          .post('/v1/courses/1/instances/1/grades/csv')
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

        const roles: Array<CourseInstanceRole> = await CourseInstanceRole.findAll({
          where: {
            userId: {
              [Op.in]: users.map((user: User) => user.id)
            },
            courseInstanceId: 1,
            role: 'STUDENT'
          }
        });

        expect(users.length).toBe(2);
        expect(roles.length).toBe(2);
        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data).toBeDefined();
      });

    it('should update attainment grade if user grading data already exist in the db', async () => {
      const user: User = await User.findOne({
        where: {
          studentNumber: '662292'
        }
      }) as User;

      let userAttainment: UserAttainmentGrade = await UserAttainmentGrade.findOne({
        where: {
          userId: user.id,
          attainmentId: 1
        }
      }) as UserAttainmentGrade;

      expect(userAttainment.grade).toBe(6);

      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_updated.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      userAttainment = await UserAttainmentGrade.findOne({
        where: {
          userId: user.id,
          attainmentId: 1
        }
      }) as UserAttainmentGrade;

      expect(userAttainment.grade).toBe(16);
      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should process big CSV succesfully (1100 x 178 = 195 800 individual attainment grades)',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_big.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/6/instances/9/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
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
          .post('/v1/courses/1/instances/1/grades/csv')
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
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        const expectedErrors: Array<string> = [
          'Header attainment data parsing failed at column 2.' +
        ' Expected attainment id to type of number, received string.',
          'Header attainment data parsing failed at column 4.' +
        ' Expected attainment id to type of number, received string.',
          'Header attainment data parsing failed at column 6.' +
        ' Expected attainment id to type of number, received string.'
        ];
        checkErrorRes(expectedErrors, HttpCode.BadRequest);
      });

    it('should respond with 400 bad request, if the CSV file grading data parsing fails',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_incorrect_grade_rows.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        const expectedErrors: Array<string> = [
          'CSV file row 3 column 5 expected number, received "7r"',
          'CSV file row 5 column 2 expected number, received "xx"',
          'CSV file row 6 column 4 expected number, received "err"'
        ];
        checkErrorRes(expectedErrors, HttpCode.BadRequest);
      });

    it(
      'should respond with 400 bad request, if the CSV file parsing fails (one row invalid length)',
      async () => {
        const invalidCsvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_invalid_row.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', invalidCsvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['Invalid Record Length: expect 7, got 6 on line 4'], HttpCode.BadRequest);
      });

    it(
      'should respond with 400 bad request, if the CSV file field name not "csv_data"',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach(badInput, csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          ['Unexpected field. To upload CSV file, set input field name as "csv_data"'],
          HttpCode.BadRequest
        );
      });

    it('should respond with 400 bad request, if the file content-type not text/csv',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', csvData, { contentType: 'application/json' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
      });

    it('should respond with 400 bad request, if the file extension incorrect (.txt)',
      async () => {
        const txtFile: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/wrong_file_type.txt'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', txtFile, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
      });

    it('should respond with 400 bad request, if the CSV file not found in the request.',
      async () => {
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
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
          .post(`/v1/courses/${badInput}/instances/1/grades/csv`)
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

    it('should respond with 400 bad request, if validation fails (non-number course instance id)',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
        );
        res = await request
          .post(`/v1/courses/1/instances/${badInput}/grades/csv`)
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
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/${badId}/instances/1/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course instance does not exist', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/1/instances/${badId}/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes([`course instance with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 409 conflict, if instance does not belong to the course', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/2/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkErrorRes(
        ['course instance with ID 2 does not belong to the course with ID 1'],
        HttpCode.Conflict
      );
    });

    it(
      'should respond with 409 conflict, if CSV includes users with role TEACHER/TEACHER_IN_CHARGE',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_teacher_in_row.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          ['User(s) with role "TEACHER" or "TEACHER_IN_CHARGE" found from the CSV.'],
          HttpCode.Conflict
        );
      });

    it(
      'should respond with 422 unprocessable entity, if attainment does not belong to the instance',
      async () => {
        const csvData: fs.ReadStream = fs.createReadStream(
          path.resolve(__dirname, '../mock-data/csv/grades_non_existing_attainments.csv'), 'utf8'
        );
        res = await request
          .post('/v1/courses/1/instances/1/grades/csv')
          .attach('csv_data', csvData, { contentType: 'text/csv' })
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        checkErrorRes(
          [
            'Attainments with following IDs do not exist' +
            ' or belong to this course instance: 666, 999.'
          ],
          HttpCode.UnprocessableEntity
        );
      });

  });

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/calculate', () => {

  it('should calculate correct grade, numeric grade', async () => {
    checkSuccessRes(await request
      .post('/v1/courses/5/instances/8/grades/calculate')
      .set('Cookie', cookies.userCookie));

    const result: CourseResult | null = await CourseResult.findOne({
      where: {
        courseInstanceId: 8,
        userId: 1
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('1.24');
    expect(result?.credits).toBe(5);
  });

  it('should calculate correct grade, PASS/FAIL grade', async () => {
    checkSuccessRes(await request
      .post('/v1/courses/1/instances/10/grades/calculate')
      .set('Cookie', cookies.userCookie));

    let result: CourseResult | null = await CourseResult.findOne({
      where: {
        courseInstanceId: 10,
        userId: 95
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('PASS');
    expect(result?.credits).toBe(5);

    result = await CourseResult.findOne({
      where: {
        courseInstanceId: 10,
        userId: 100
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('FAIL');
    expect(result?.credits).toBe(5);
  });

  it('should calculate multiple correct grades', async () => {
    checkSuccessRes(await request
      .post('/v1/courses/4/instances/6/grades/calculate')
      .set('Cookie', cookies.userCookie));

    let result: CourseResult | null = await CourseResult.findOne({
      where: {
        courseInstanceId: 6,
        userId: 35
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('1.5');
    expect(result?.credits).toBe(5);

    result = await CourseResult.findOne({
      where: {
        courseInstanceId: 6,
        userId: 90
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('4.75');
    expect(result?.credits).toBe(5);
  });

  it('should calculate correct grades in higher depths', async () => {
    checkSuccessRes(await request
      .post('/v1/courses/4/instances/7/grades/calculate')
      .set('Cookie', cookies.userCookie));

    const result: CourseResult | null = await CourseResult.findOne({
      where: {
        courseInstanceId: 7,
        userId: 25
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('3.12');
    expect(result?.credits).toBe(5);
  });

  it('should allow manually overriding a student\'s grade', async () => {
    checkSuccessRes(await request
      .post('/v1/courses/3/instances/4/grades/calculate')
      .set('Cookie', cookies.userCookie));

    const result: CourseResult | null = await CourseResult.findOne({
      where: {
        courseInstanceId: 4,
        userId: 13
      }
    });
    expect(result).not.toBe(null);
    expect(result?.grade).toBe('5');
    expect(result?.credits).toBe(5);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .post('/v1/courses/1/instances/1/grades/calculate')
      .expect(HttpCode.Unauthorized);
  });

});

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId/grades/csv/sisu' +
  ' - export Sisu compatible grading in CSV',
  () => {

    it('should export CSV succesfully when course results are found', async () => {
      res = await request
        .get('/v1/courses/1/instances/1/grades/csv/sisu')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,Pass,5,9.12.2022,en,
114732,5,5,9.12.2022,en,
472886,3,5,9.12.2022,en,
335462,Pass,5,9.12.2022,en,
874623,2,5,9.12.2022,en,
345752,Pass,5,9.12.2022,en,
353418,4,5,9.12.2022,en,
986957,Fail,5,9.12.2022,en,
611238,4,5,9.12.2022,en,
691296,1,5,9.12.2022,en,
271778,Fail,5,9.12.2022,en,
344644,1,5,9.12.2022,en,
954954,5,5,9.12.2022,en,
`);
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="final_grades_course_CS-A1110_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
      );
    });

    it('should export CSV succesfully with custom assessmentDate and completionLanguage',
      async () => {
        res = await request
        // eslint-disable-next-line max-len
          .get('/v1/courses/1/instances/1/grades/csv/sisu?assessmentDate=2023-05-12&completionLanguage=sv')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'text/csv')
          .expect(HttpCode.Ok);

        expect(res.text).toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
117486,Pass,5,12.5.2023,sv,
114732,5,5,12.5.2023,sv,
472886,3,5,12.5.2023,sv,
335462,Pass,5,12.5.2023,sv,
874623,2,5,12.5.2023,sv,
345752,Pass,5,12.5.2023,sv,
353418,4,5,12.5.2023,sv,
986957,Fail,5,12.5.2023,sv,
611238,4,5,12.5.2023,sv,
691296,1,5,12.5.2023,sv,
271778,Fail,5,12.5.2023,sv,
344644,1,5,12.5.2023,sv,
954954,5,5,12.5.2023,sv,
`);
        expect(res.headers['content-disposition']).toBe(
          'attachment; filename="final_grades_course_CS-A1110_' +
        `${(new Date()).toLocaleDateString('fi-FI')}.csv"`
        );
      });

    it(
      'should respond with 400 bad request, if (optional) completionLanguage param is not valid',
      async () => {
        res = await request
          .get('/v1/courses/1/instances/1/grades/csv/sisu?completionLanguage=xy')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'completionLanguage must be one of the following values:' +
          ' fi, sv, en, es, ja, zh, pt, fr, de, ru'
        ], HttpCode.BadRequest);
      });

    it(
      'should respond with 400 bad request, if (optional) assessmentDate param is not valid date',
      async () => {
        res = await request
          .get('/v1/courses/1/instances/1/grades/csv/sisu?assessmentDate=notValidDate')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'assessmentDate must be a `date` type, but the final value was:' +
          ' `Invalid Date` (cast from the value `"notValidDate"`).'
        ], HttpCode.BadRequest);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request.get('/v1/courses/1/instances/1/grades/csv/sisu')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, if grades have not been calculated yet', async () => {
      res = await request
        .get('/v1/courses/2/instances/2/grades/csv/sisu')
        .set('Cookie', cookies.adminCookie);

      checkErrorRes(
        [
          'no grades found, make sure grades have been' +
        ' calculated before requesting course result CSV'
        ],
        HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      res = await request
        .get(`/v1/courses/${badId}/instances/1/grades/csv/sisu`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course instance does not exist', async () => {
      res = await request
        .get(`/v1/courses/1/instances/${badId}/grades/csv/sisu`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course instance with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 409 conflict, if instance does not belong to the course', async () => {
      res = await request
        .get('/v1/courses/1/instances/2/grades/csv/sisu')
        .set('Cookie', cookies.adminCookie);

      checkErrorRes(
        ['course instance with ID 2 does not belong to the course with ID 1'],
        HttpCode.Conflict
      );
    });

  });

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId/grades - get final grades in JSON', () => {

    it('should get final grades succesfully when course results are found', async () => {
      res = await request
        .get('/v1/courses/1/instances/1/grades')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      checkSuccessRes(res);
      expect(res.body.data.finalGrades).toEqual([
        { id: 1, studentNumber: '117486', grade: 'Pass', credits: 5 },
        { id: 2, studentNumber: '114732', grade: '5', credits: 5 },
        { id: 3, studentNumber: '472886', grade: '3', credits: 5 },
        { id: 4, studentNumber: '335462', grade: 'Pass', credits: 5 },
        { id: 5, studentNumber: '874623', grade: '2', credits: 5 },
        { id: 6, studentNumber: '345752', grade: 'Pass', credits: 5 },
        { id: 7, studentNumber: '353418', grade: '4', credits: 5 },
        { id: 8, studentNumber: '986957', grade: 'Fail', credits: 5 },
        { id: 9, studentNumber: '611238', grade: '4', credits: 5 },
        { id: 10, studentNumber: '691296', grade: '1', credits: 5 },
        { id: 11, studentNumber: '271778', grade: 'Fail', credits: 5 },
        { id: 12, studentNumber: '344644', grade: '1', credits: 5 },
        { id: 13, studentNumber: '954954', grade: '5', credits: 5 }
      ]);
    });

    it(
      'should respond with 400 bad request, if course or instance ID not is valid', async () => {
        res = await request
          .get(`/v1/courses/${badInput}/instances/1/grades`)
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'id must be a `number` type, but the final value was:' +
          // eslint-disable-next-line no-useless-escape
          ' `NaN` (cast from the value `\"notValid\"`).'], HttpCode.BadRequest);

        res = await request
          .get(`/v1/courses/1/instances/${badInput}/grades`)
          .set('Cookie', cookies.adminCookie);

        checkErrorRes([
          'id must be a `number` type, but the final value was:' +
            // eslint-disable-next-line no-useless-escape
            ' `NaN` (cast from the value `\"notValid\"`).'], HttpCode.BadRequest);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request.get('/v1/courses/1/instances/1/grades')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, if grades have not been calculated yet', async () => {
      res = await request
        .get('/v1/courses/2/instances/2/grades')
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.NotFound);

      checkErrorRes(
        [
          'no grades found, make sure grades have been' +
          ' calculated before requesting course results'
        ],
        HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      res = await request
        .get(`/v1/courses/${badId}/instances/1/grades`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 404 not found, if course instance does not exist', async () => {
      res = await request
        .get(`/v1/courses/1/instances/${badId}/grades`)
        .set('Cookie', cookies.adminCookie);

      checkErrorRes([`course instance with ID ${badId} not found`], HttpCode.NotFound);
    });

    it('should respond with 409 conflict, if instance does not belong to the course', async () => {
      res = await request
        .get('/v1/courses/1/instances/2/grades')
        .set('Cookie', cookies.adminCookie);

      checkErrorRes(
        ['course instance with ID 2 does not belong to the course with ID 1'],
        HttpCode.Conflict
      );
    });

  });
