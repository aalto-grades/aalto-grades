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

describe('Test POST /v1/courses/:courseId/instances/:instanceId/grades/csv', () => {

  it('should process CSV succesfully when course and course instance exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );

    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('csv_data', csvData, 'grades.csv');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 400 bad request, if the CSV file parsing fails', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades_invalid_row.csv'), 'utf8'
    );

    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/grades/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('csv_data', csvData, 'grades.csv');

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain('Invalid Record Length: expect 6, got 5 on line 4');
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
      );

      const res: supertest.Response = await request
        .post(`/v1/courses/${badInput}/instances/1/grades/csv`)
        .set('Content-Type', 'multipart/form-data')
        .attach('csv_data', csvData, 'grades.csv');

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toContain(
        'id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).'
      );
      expect(res.body.data).not.toBeDefined();
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });


  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const csvData: fs.ReadStream = fs.createReadStream(
        path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
      );

      const res: supertest.Response = await request
        .post(`/v1/courses/1/instances/${badInput}/grades/csv`)
        .set('Content-Type', 'multipart/form-data')
        .attach('csv_data', csvData, 'grades.csv');

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toContain(
        'id must be a `number` type, but the final value was: `NaN` (cast from the value `NaN`).'
      );
      expect(res.body.data).not.toBeDefined();
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 404 not found, if course does not exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );

    const res: supertest.Response = await request
      .post(`/v1/courses/${badId}/instances/1/grades/csv`)
      .set('Content-Type', 'multipart/form-data')
      .attach('csv_data', csvData, 'grades.csv');

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(`course with ID ${badId} not found`);
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 404 not found, if course instance does not exist', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );

    const res: supertest.Response = await request
      .post(`/v1/courses/1/instances/${badId}/grades/csv`)
      .set('Content-Type', 'multipart/form-data')
      .attach('csv_data', csvData, 'grades.csv');

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(`course instance with ID ${badId} not found`);
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 409 conflict, if instance does not belong to the course', async () => {
    const csvData: fs.ReadStream = fs.createReadStream(
      path.resolve(__dirname, '../mockData/csv/grades.csv'), 'utf8'
    );

    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/2/grades/csv')
      .set('Content-Type', 'multipart/form-data')
      .attach('csv_data', csvData, 'grades.csv');

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toContain(
      'course instance with ID 2 does not belong to the course with ID 1'
    );
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Conflict);
  });
});
