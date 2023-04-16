// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as fs from 'fs';
import path from 'path';
import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let res: supertest.Response;

function checkErrorRes(errorMessage: string, errorCode: HttpCode): void {
  expect(res.body.success).toBe(false);
  expect(res.body.errors).toContain(errorMessage);
  expect(res.body.data).not.toBeDefined();
  expect(res.statusCode).toBe(errorCode);
}

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/csv', () => {

  it('should process CSV succesfully when course and course instance exist', async () => {
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

  it('should respond with 400 bad request, if the CSV file parsing fails (one row invalid length)',
    async () => {
      const invalidCsvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades_invalid_row.csv'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', invalidCsvData, { contentType: 'text/csv'});

      checkErrorRes('Invalid Record Length: expect 6, got 5 on line 4', HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file field name not "csv_data"', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .attach(badInput, csvData, { contentType: 'text/csv'});

    checkErrorRes(
      'Unexpected field. To upload CSV file, set input field name as "csv_data"',
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

      checkErrorRes('incorrect file format, use the CSV format', HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the file extension incorrect (.txt)',
    async () => {
      const txtFile: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/wrong_file_type.txt'), 'utf8'
      );
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', txtFile, { contentType: 'text/csv'});

      checkErrorRes('incorrect file format, use the CSV format', HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if the CSV file not found in the request.',
    async () => {
      res = await request
        .post('/v1/courses/1/instances/1/grades/csv')
        .attach('csv_data', false, { contentType: 'text/csv'});

      checkErrorRes(
        'CSV file not found in the request. To upload CSV file, set input field name as "csv_data"',
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
        'id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).',
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
        'id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).',
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

    checkErrorRes(`course with ID ${badId} not found`, HttpCode.NotFound);
  });

  it('should respond with 404 not found, if course instance does not exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post(`/v1/courses/1/instances/${badId}/grades/csv`)
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    checkErrorRes(`course instance with ID ${badId} not found`, HttpCode.NotFound);
  });

  it('should respond with 409 conflict, if instance does not belong to the course', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );
    res = await request
      .post('/v1/courses/1/instances/2/grades/csv')
      .attach('csv_data', csvData, { contentType: 'text/csv'});

    checkErrorRes(
      'course instance with ID 2 does not belong to the course with ID 1',
      HttpCode.Conflict
    );
  });
});

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/calculate', () => {
  it('should calculate correct grades', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/5/instances/8/grades/calculate');

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(HttpCode.Ok);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.grades).toEqual([
      {
        studentNumber: '352772',
        grade: 1.24,
        status: 'pass'
      }
    ]);
  });
});
