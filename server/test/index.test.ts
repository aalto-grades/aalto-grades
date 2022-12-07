// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../src/index';
import supertest from 'supertest';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test GET /', () => {
  it('should respond "Hello /" with status code 200', () => {
    request.get('/')
      .then((res: supertest.Response) => {
        expect(res.text).toBe('Hello /');
        expect(res.statusCode).toBe(200);
      });
  });
});
