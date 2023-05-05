// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import supertest from 'supertest';

import Attainable from '../../src/database/models/attainable';
import CourseInstanceRole from '../../src/database/models/courseInstanceRole';
import User from '../../src/database/models/user';
import UserAttainmentGrade from '../../src/database/models/userAttainmentGrade';

import { app } from '../../src/app';
import { Formula } from '../../src/types/formulas';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let res: supertest.Response;

function checkErrorRes(errorMessages: Array<string>, errorCode: HttpCode): void {
  expect(res.body.success).toBe(false);
  errorMessages.forEach((error: string) => expect(res.body.errors).toContain(error));
  expect(res.body.data).not.toBeDefined();
  expect(res.statusCode).toBe(errorCode);
}

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/csv', () => {

  it('should process CSV succesfully when course, course instance and users exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it(
    'should create and add users to the course with role STUDENT when user does not exist in db',
    async () => {
      let users: Array<User> = await User.findAll({
        where: {
          studentId: {
            [Op.in]: ['987654', '998877']
          }
        }
      });

      expect(users.length).toBe(0);
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_non-existing_students.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      users = await User.findAll({
        where: {
          studentId: {
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
      expect(res.statusCode).toBe(HttpCode.Ok);
    });

  it('should update attainment grade if user grading data already exist in the db', async () => {
    const user: User = await User.findOne({
      where: {
        studentId: '662292'
      }
    }) as User;

    let userAttainment: UserAttainmentGrade = await UserAttainmentGrade.findOne({
      where: {
        userId: user.id,
        attainableId: 1
      }
    }) as UserAttainmentGrade;

    expect(userAttainment.grade).toBe(6);

    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades_updated.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    userAttainment = await UserAttainmentGrade.findOne({
      where: {
        userId: user.id,
        attainableId: 1
      }
    }) as UserAttainmentGrade;

    expect(userAttainment.grade).toBe(16);
    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should process big CSV succesfully (1100 x 178 = 195 800 individual attainment grades)',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_big.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/6/instances/9/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.statusCode).toBe(HttpCode.Ok);
    }, 35000);

  it(
    'should respond with 400 bad request, if the CSV has only student numbers and no grading data',
    async () => {
      const invalidCsvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_only_student_numbers.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', invalidCsvData, { contentType: 'text/csv'});

      checkErrorRes(
        ['No attainments found from the header, please upload valid CSV.'], HttpCode.BadRequest
      );
    });

  it('should respond with 400 bad request, if the CSV file header parsing fails',
    async () => {
      const invalidCsvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_incorrect_header_columns.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', invalidCsvData, { contentType: 'text/csv'});

      const expectedErrors: Array<string> = [
        'Header attainment data parsing failed at column 2.' +
        ' Received C1IYA1, expected format C{courseId}I{courseInstanceId}A{attainmentId}.',
        'Header attainment data parsing failed at column 4.' +
        ' Received X1I1A9, expected format C{courseId}I{courseInstanceId}A{attainmentId}.',
        'Header attainment data parsing failed at column 6.' +
        ' Received C1I1AT7, expected format C{courseId}I{courseInstanceId}A{attainmentId}.'
      ];
      checkErrorRes(expectedErrors, HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file grading data parsing fails',
    async () => {
      const invalidCsvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_incorrect_grade_rows.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', invalidCsvData, { contentType: 'text/csv'});

      const expectedErrors: Array<string> = [
        'CSV file row 3 column 5 expected number, received "7r"',
        'CSV file row 5 column 2 expected number, received "xx"',
        'CSV file row 6 column 4 expected number, received "err"'
      ];
      checkErrorRes(expectedErrors, HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file parsing fails (one row invalid length)',
    async () => {
      const invalidCsvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_invalid_row.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', invalidCsvData, { contentType: 'text/csv'});

      checkErrorRes(['Invalid Record Length: expect 7, got 6 on line 4'], HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file field name not "csv_data"', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .attach(badInput, csvData, { contentType: 'text/csv'});

    checkErrorRes(
      ['Unexpected field. To upload CSV file, set input field name as "csv_data"'],
      HttpCode.BadRequest
    );
  });

  it('should respond with 400 bad request, if the file content-type not text/csv',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'application/json'});

      checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the file extension incorrect (.txt)',
    async () => {
      const txtFile: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/wrong_file_type.txt'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', txtFile, { contentType: 'text/csv'});

      checkErrorRes(['incorrect file format, use the CSV format'], HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file not found in the request.',
    async () => {
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', false, { contentType: 'text/csv'});

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
        path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/${badInput}/instances/1/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      checkErrorRes(
        ['id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).'],
        HttpCode.BadRequest
      );
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
      );
      res = await request
        .post(`/v1/courses/1/instances/${badInput}/grades/csv`)
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      checkErrorRes(
        ['id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).'],
        HttpCode.BadRequest
      );
    });

  it('should respond with 404 not found, if course does not exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post(`/v1/courses/${badId}/instances/1/grades/csv`)
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    checkErrorRes([`course with ID ${badId} not found`], HttpCode.NotFound);
  });

  it('should respond with 404 not found, if course instance does not exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post(`/v1/courses/1/instances/${badId}/grades/csv`)
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    checkErrorRes([`course instance with ID ${badId} not found`], HttpCode.NotFound);
  });

  it('should respond with 409 conflict, if instance does not belong to the course', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/2/grades/csv')
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    checkErrorRes(
      ['course instance with ID 2 does not belong to the course with ID 1'],
      HttpCode.Conflict
    );
  });

  it('should respond with 409 conflict, if CSV includes users with role TEACHER/TEACHER_IN_CHARGE',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_teacher_in_row.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      checkErrorRes(
        ['User(s) with role "TEACHER" or "TEACHER_IN_CHARGE" found from the CSV.'],
        HttpCode.Conflict
      );
    });

  it('should respond with 422 unprocessable entity, if attainment does not belong to the instance',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_non_existing_attainables.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', csvData, { contentType: 'text/csv'});

      checkErrorRes(
        [
          'Attainments with following IDs do not exist or belong to this course instance: 666, 999.'
        ],
        HttpCode.UnprocessableEntity
      );
    });
});

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/calculate', () => {
  /*
   * no-explicit-any is disabled in the following tests to mock Sequelize
   * return values more easily.
   */

  function checkSuccessRes(res: supertest.Response, finalGrades: Array<object>): void {
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(HttpCode.Ok);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.grades).toEqual(finalGrades);
  }

  it('should calculate one correct grade', async () => {
    checkSuccessRes(
      await request.post('/v1/courses/5/instances/8/grades/calculate'),
      [
        {
          studentNumber: '352772',
          grade: 1.24,
          status: 'pass'
        }
      ]
    );
  });

  it('should calculate multiple correct grades', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(Attainable, 'findAll').mockImplementation((): any => {
      return [
        {
          id: 1,
          parentId: null,
          formula: Formula.WeightedAverage,
          parentFormulaParams: null
        },
        {
          id: 2,
          parentId: 1,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.75
          }
        },
        {
          id: 3,
          parentId: 1,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.25
          }
        },
      ];
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(UserAttainmentGrade, 'findAll').mockImplementation((): any => {
      return [
        {
          User: {
            studentId: '111111'
          },
          grade: 1,
          attainableId: 2,
        },
        {
          User: {
            studentId: '111111'
          },
          grade: 3,
          attainableId: 3,
        },
        {
          User: {
            studentId: '222222'
          },
          grade: 5,
          attainableId: 2,
        },
        {
          User: {
            studentId: '222222'
          },
          grade: 4,
          attainableId: 3,
        },
        {
          User: {
            studentId: '333333'
          },
          grade: 4,
          attainableId: 2,
        },
        {
          User: {
            studentId: '333333'
          },
          grade: 1,
          attainableId: 3,
        }
      ];
    });

    checkSuccessRes(
      await request.post('/v1/courses/1/instances/1/grades/calculate'),
      [
        {
          studentNumber: '111111',
          grade: 1.5,
          status: 'pass'
        },
        {
          studentNumber: '222222',
          grade: 4.75,
          status: 'pass'
        },
        {
          studentNumber: '333333',
          grade: 3.25,
          status: 'pass'
        }
      ]
    );
  });

  it('should calculate correct grades in higher depths', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(Attainable, 'findAll').mockImplementation((): any => {
      return [
        {
          id: 1,
          parentId: null,
          formula: Formula.WeightedAverage,
          parentFormulaParams: null
        },
        {
          id: 2,
          parentId: 1,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.4
          }
        },
        {
          id: 3,
          parentId: 1,
          formula: Formula.WeightedAverage,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.6
          }
        },
        {
          id: 4,
          parentId: 3,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.1
          }
        },
        {
          id: 5,
          parentId: 3,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.1
          }
        },
        {
          id: 6,
          parentId: 3,
          formula: Formula.WeightedAverage,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.8
          }
        },
        {
          id: 7,
          parentId: 6,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.5
          }
        },
        {
          id: 8,
          parentId: 6,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.5
          }
        }
      ];
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(UserAttainmentGrade, 'findAll').mockImplementation((): any => {
      return [
        {
          User: {
            studentId: '123456'
          },
          grade: 3,
          attainableId: 2,
        },
        {
          User: {
            studentId: '123456'
          },
          grade: 4,
          attainableId: 4,
        },
        {
          User: {
            studentId: '123456'
          },
          grade: 4,
          attainableId: 5,
        },
        {
          User: {
            studentId: '123456'
          },
          grade: 1,
          attainableId: 7,
        },
        {
          User: {
            studentId: '123456'
          },
          grade: 5,
          attainableId: 8,
        }
      ];
    });

    checkSuccessRes(
      await request.post('/v1/courses/1/instances/1/grades/calculate'),
      [
        {
          studentNumber: '123456',
          grade: 3.12,
          status: 'pass'
        }
      ]
    );
  });

  it('should allow manually overriding a student\'s grade', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(Attainable, 'findAll').mockImplementation((): any => {
      return [
        {
          id: 1,
          parentId: null,
          formula: Formula.WeightedAverage,
          parentFormulaParams: null
        },
        {
          id: 2,
          parentId: 1,
          formula: Formula.Manual,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.5
          }
        },
        {
          id: 3,
          parentId: 1,
          formula: Formula.WeightedAverage,
          parentFormulaParams: {
            min: 0,
            max: 5,
            weight: 0.5
          }
        }
      ];
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(UserAttainmentGrade, 'findAll').mockImplementation((): any => {
      return [
        {
          User: {
            studentId: '654321'
          },
          grade: 5,
          attainableId: 1,
        },
        {
          User: {
            studentId: '654321'
          },
          grade: 0,
          attainableId: 2,
        },
        {
          User: {
            studentId: '654321'
          },
          grade: 0,
          attainableId: 3,
        }
      ];
    });

    checkSuccessRes(
      await request.post('/v1/courses/1/instances/1/grades/calculate'),
      [
        {
          studentNumber: '654321',
          grade: 5,
          status: 'pass'
        }
      ]
    );
  });
});
