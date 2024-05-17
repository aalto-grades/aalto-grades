// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import TestAgent from 'supertest/lib/agent';
import Test from 'supertest/lib/test';
import {z} from 'zod';

import {HttpCode} from '@/common/types';
import {ErrorSchema, ZodErrorSchema} from './general';

type ReqData = string | object | undefined;
type ReturnType = {
  get: () => Promise<void>;
  post: (data: ReqData) => Promise<void>;
  put: (data: ReqData) => Promise<void>;
  delete: () => Promise<void>;
};

export class ResponseTests {
  request: TestAgent;

  constructor(request: TestAgent) {
    this.request = request;
  }

  /** Send a request and expect a 400 bad request */
  testBadRequest(url: string, cookie: string[]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      const Schema = z.union([ErrorSchema, ZodErrorSchema]);
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 401 unauthorized */
  testUnauthorized(url: string): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(JSON.stringify(res.body)).toBe('{}');
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 403 forbidden */
  testForbidden(url: string, cookies: string[][]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      for (const cookie of cookies) {
        const res = await request
          .set('Cookie', cookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Forbidden);

        const result = await ErrorSchema.safeParseAsync(res.body);
        expect(result.success).toBeTruthy();
      }
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 404 not found */
  testNotFound(url: string, cookie: string[]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 409 conflict */
  testConflict(url: string, cookie: string[]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Conflict);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 422 Unprocessable Entity */
  testUnprocessableEntity(url: string, cookie: string[]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.UnprocessableEntity);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }

  /** Send a request and expect a 502 Bad Gateway */
  testBadGateway(url: string, cookie: string[]): ReturnType {
    const call = async (request: Test): Promise<void> => {
      const res = await request
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadGateway);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    return {
      get: async () => await call(this.request.get(url)),
      post: async (data: ReqData) =>
        await call(this.request.post(url).send(data)),
      put: async (data: ReqData) =>
        await call(this.request.put(url).send(data)),
      delete: async () => await call(this.request.delete(url)),
    };
  }
}
