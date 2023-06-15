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
  'Test GET /v1/courses/:courseId/instance/:instanceId/grades/csv - get grading CSV template',
  () => {
    it('should get correct CSV template with attainments and students', async () => {
      res = await request
        .get('/v1/courses/6/instances/15/grades/csv')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(
        'StudentNo,tag216,tag217,tag218,tag219,tag220\n949181\n482499\n928455\n'
          + '967943\n758134\n669632\n972741\n581345\n146776\n841628\n489575\n'
          + '233634\n792991\n272775\n989786\n848131\n414196\n768469\n135698\n'
          + '654446\n876383\n869596\n873688\n218613\n382863\n395254\n156582\n'
          + '153965\n298593\n823351\n543974\n257456\n327634\n412821\n392124\n'
          + '812362\n861871\n836789\n812536\n115692\n859475\n365471\n952346\n'
          + '731177\n387822\n483962\n647769\n712925\n948346\n133993\n681869\n'
          + '117313\n713371\n818764\n317532\n385351\n186126\n519242\n536588\n'
          + '289563\n578931\n512972\n877485\n673513\n611453\n699727\n399482\n'
          + '436666\n187433\n861319\n258347\n524823\n354773\n869149\n674834\n'
          + '883356\n665637\n393391\n794738\n352731\n326834\n939318\n621823\n'
          + '914239\n655213\n112293\n174777\n851683\n398362\n968298\n864639\n'
          + '787375\n332761\n991474\n179892\n935676\n935881\n618951\n783616\n'
          + '479434\n894162\n429213\n699121\n724447\n648857\n689995\n654799\n'
          + '548649\n679949\n511163\n431272\n533544\n341544\n657956\n415513\n'
          + '591948\n472965\n866641\n898626\n563574\n482446\n583676\n886993\n'
          + '211572\n755449\n295741\n777493\n797459\n633789\n358639\n927369\n'
          + '333414\n674485\n'
      );

      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="course_MS-A0102_grading_template.csv"'
      );
    });

    it('should get correct CSV template with attainments and no students', async () => {
      res = await request
        .get('/v1/courses/6/instances/22/grades/csv')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text).toBe(
        'StudentNo,tag221,tag222,tag223\n'
      );

      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="course_MS-A0102_grading_template.csv"'
      );
    });

    it(
      'should respond with 404 not found if the course instance has no attainments',
      async () => {
        res = await request
          .get('/v1/courses/6/instances/23/grades/csv')
          .set('Cookie', cookies.adminCookie);

        checkErrorRes(
          ['no attainments found for course instance with ID 23, '
            + 'add attainments to the course instance to generate a template'],
          HttpCode.NotFound
        );
      }
    );
  }
);

describe(
  'Test POST /v1/courses/:courseId/instances/:instanceId/grades/csv - import grading data from CSV',
  () => {

    it('should process CSV succesfully when attainments and users exist', async () => {
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

    it('should mark attainment grades as manual', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_one.csv'), 'utf8'
      );

      res = await request
        .post('/v1/courses/5/instances/14/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const userAttainment: UserAttainmentGrade = await UserAttainmentGrade.findOne({
        where: {
          userId: 4,
          attainmentId: 224
        }
      }) as UserAttainmentGrade;

      expect(userAttainment).not.toBeNull;
      expect(userAttainment.manual).toBe(true);
      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should mark correct grader ID', async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mock-data/csv/grades_one_2.csv'), 'utf8'
      );

      res = await request
        .post('/v1/courses/5/instances/14/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv' })
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const userAttainment: UserAttainmentGrade = await UserAttainmentGrade.findOne({
        where: {
          userId: 4,
          attainmentId: 225
        }
      }) as UserAttainmentGrade;

      const selfInfo: supertest.Response = await request
        .get('/v1/auth/self-info')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(userAttainment.graderId).toBe(selfInfo.body.data.id);
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

        function errorMessage(column: number, tag: string, instanceId: number): string {
          return `Header attainment data parsing failed at column ${column}. `
            + `Could not find an attainment with tag ${tag} in `
            + `course instance with ID ${instanceId}.`;
        }

        const expectedErrors: Array<string> = [
          errorMessage(2, 'first-fake', 1),
          errorMessage(3, 'tag2', 1),
          errorMessage(4, 'second-fake;', 1),
          errorMessage(6, 'third-fake', 1)
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

  }
);

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
