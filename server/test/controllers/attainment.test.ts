// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Op } from 'sequelize';
import supertest from 'supertest';

import Attainment from '../../src/database/models/attainment';
import TeacherInCharge from '../../src/database/models/teacherInCharge';

import { AttainmentData, Formula } from 'aalto-grades-common/types';
import { mockAttainment, jestMockAttainment } from '../mock-data/attainment';
import { mockTeacher } from '../mock-data/misc';
import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

function verifyAttainmentData(
  data: AttainmentData,
  id: number,
  assessmentModelId: number,
  subAttainments: boolean
): void {
  expect(data.id).toBe(id);
  expect(data.assessmentModelId).toBe(assessmentModelId);
  expect(data.tag).toBeDefined();
  expect(data.name).toBeDefined();
  expect(data.daysValid).toBeDefined();
  if (subAttainments)
    expect(data.subAttainments).toBeDefined();
  else
    expect(data.subAttainments).not.toBeDefined();
}

interface AttainmentNode {
  id: number,
  subAttainments: Array<AttainmentNode>
}

function evaluateSubAttainment(attainment: AttainmentData): void {
  if (attainment.subAttainments && attainment.subAttainments.length > 0) {
    for (const subAttainment of attainment.subAttainments) {
      evaluateSubAttainment(subAttainment);
    }
  }
  expect(attainment.id).toBeDefined();
  expect(attainment.assessmentModelId).toBeDefined();
  expect(attainment.name).toBeDefined();
  expect(attainment.parentId).toBeDefined();
  expect(attainment.tag).toBeDefined();
  expect(attainment.formula).toBeDefined();
  expect(attainment.formulaParams).toBeDefined();
  expect(attainment.daysValid).toBeDefined();
}

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId'
  + ' - get attainment (tree)',
  () => {

    it('should respond with a single attainment without subattainments, '
      + 'if query string is not present', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 2, 2, false);
    });

    it('should respond with a single attainment with one level of subattainments, '
      + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 2, 2, true);

      verifyAttainmentData(res.body.data.attainment.subAttainments[1], 6, 2, false);
      verifyAttainmentData(res.body.data.attainment.subAttainments[0], 10, 2, false);
    });

    it('should respond with a single attainment with a full tree of subattainments, '
      + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 2, 2, true);
      verifyAttainmentData(res.body.data.attainment.subAttainments[1], 6, 2, true);
      verifyAttainmentData(
        res.body.data.attainment.subAttainments[1].subAttainments[0],
        214,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data.attainment.subAttainments[1].subAttainments[0].subAttainments[0],
        215,
        2,
        false
      );
      verifyAttainmentData(res.body.data.attainment.subAttainments[0], 10, 2, false);
    });

    it('should respond with 400 Bad Request, if "tree" parameter in query string '
      + 'is invalid', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=fail')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be one of the '
        + 'following values: children, descendants');
    });

    it('should respond with 400 Bad Request, if "tree" parameter is given twice '
      + '(array instead of string)', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=children&tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be a `string` type, but the final value was: '
        + '`[\n  "\\"children\\"",\n  "\\"descendants\\""\n]`.');
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/2/assessment-models/2/attainments/2')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });
  }
);

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId/attainments'
  + ' - get the root attainment of an assessment model',
  () => {

    it('should respond with correct data', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/assessment-models/1/attainments')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 1, 1, true);
    });

    it('should respond with a single attainment with one level of subattainments, '
    + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 2, 2, true);
      verifyAttainmentData(res.body.data.attainment.subAttainments[1], 6, 2, false);
      verifyAttainmentData(res.body.data.attainment.subAttainments[0], 10, 2, false);
    });

    it('should respond with a single attainment with a full tree of subattainments, '
    + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data.attainment, 2, 2, true);
      verifyAttainmentData(res.body.data.attainment.subAttainments[1], 6, 2, true);
      verifyAttainmentData(res.body.data.attainment.subAttainments[0], 10, 2, false);
      verifyAttainmentData(
        res.body.data.attainment.subAttainments[1].subAttainments[0],
        214,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data.attainment.subAttainments[1].subAttainments[0].subAttainments[0],
        215,
        2,
        false
      );
    });

    it('should respond with 400 Bad Request, if "tree" parameter in query string '
    + 'is invalid', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments?tree=fail')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be one of the '
      + 'following values: children, descendants');
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/1/assessment-models/1/attainments')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 409 Conflict if there are multiple root attainments',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/2/assessment-models/34/attainments')
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);
        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0]).toBe(
          'More than one attainment without parentId was found for the'
          + ' specified course and assessment model. Attainment IDs: 252,253'
        );
      }
    );

  }
);

describe(
  'Test POST /v1/courses/:courseId/assessment-models/:assessmentModelId/attainments'
  + ' - create attainment(s)',
  () => {

    it(
      'should create a new attainment with no sub-attainments when course and'
      + ' assessment model exist (admin user)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models/31/attainments')
          .send({
            name: 'New',
            tag: 'tag of the new one',
            daysValid: 365,
            formula: Formula.Manual,
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.name).toBe('New');
        expect(res.body.data.attainment.assessmentModelId).toBe(31);
        expect(res.body.data.attainment.parentId).not.toBeDefined();
        expect(res.body.data.attainment.tag).toBe('tag of the new one');
        expect(res.body.data.attainment.formula).toBe(Formula.Manual);
        expect(res.body.data.attainment.formulaParams).toBe(null);
        expect(res.body.data.attainment.daysValid).toBeDefined();
        expect(res.body.data.attainment.subAttainments).toBeDefined();
      }
    );

    it(
      'should create a new attainment with no sub-attainments when course and'
      + ' assessment model exist (teacher in charge)',
      async () => {
        jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

        const res: supertest.Response = await request
          .post('/v1/courses/2/assessment-models/35/attainments')
          .send({
            name: 'examination',
            tag: 'tag123456',
            daysValid: 365,
            formula: Formula.Manual,
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.name).toBe('examination');
        expect(res.body.data.attainment.assessmentModelId).toBe(35);
        expect(res.body.data.attainment.parentId).not.toBeDefined();
        expect(res.body.data.attainment.tag).toBe('tag123456');
        expect(res.body.data.attainment.formula).toBe(Formula.Manual);
        expect(res.body.data.attainment.formulaParams).toBe(null);
        expect(res.body.data.attainment.daysValid).toBeDefined();
        expect(res.body.data.attainment.subAttainments).toBeDefined();
      }
    );

    it('should create a new attainment with sub-attainments when course and assessment model exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models/32/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.assessmentModelId).toBe(32);
        expect(res.body.data.attainment.name).toBe(mockAttainment.name);
        expect(res.body.data.attainment.parentId).not.toBeDefined();
        expect(res.body.data.attainment.tag).toBeDefined();
        expect(res.body.data.attainment.formula).toBeDefined();
        expect(res.body.data.attainment.daysValid).toBeDefined();
        expect(res.body.data.attainment.subAttainments).toBeDefined();

        for (const subAttainment of res.body.data.attainment.subAttainments) {
          evaluateSubAttainment(subAttainment);
        }
      });

    it('should create a new attainment with parent attainment', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/3/assessment-models/3/attainments')
        .send({
          parentId: 3,
          ...mockAttainment
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.parentId).toBe(3);

      for (const subAttainment of res.body.data.attainment.subAttainments) {
        evaluateSubAttainment(subAttainment);
      }
    });

    it('should respond with 400 bad request, if validation fails (non-number assessment model id)',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/assessment-models/${badInput}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number course id)',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/${badInput}/assessment-models/1/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number parent attainment id)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/4/attainments')
          .send({ parentId: badInput, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it(
      'should respond with 400 bad request, if formula params are'
      + ' incorrect in the top level attainment',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/3/attainments')
          .send({
            parentId: 3,
            formulaParams: {
              wrong: 'yep',
              somethingIncorrect: {
                veryIncorrect: true
              }
            },
            name: 'Failure',
            tag: 'not success',
            daysValid: 6000,
            formula: Formula.WeightedAverage
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'this field has unspecified keys: wrong, somethingIncorrect'
        );
      }
    );

    it(
      'should respond with 400 bad request, if formula params are'
      + ' incorrect in subattainments',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/3/attainments')
          .send({
            parentId: 3,
            name: 'Failure',
            tag: 'not success',
            daysValid: 6000,
            formula: Formula.WeightedAverage,
            formulaParams: {
              weights: [
                ['sub not success', 1]
              ]
            },
            subAttainments: [
              {
                name: 'Subfailure',
                tag: 'sub not success',
                daysValid: 6,
                formula: Formula.WeightedAverage,
                formulaParams: {
                  weights: [
                    'wrong again', 5,
                    [1, -1]
                  ]
                }
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'weights[0] must be a `tuple` type, but the final value was: `"wrong again"`.'
        );
        expect(res.body.errors).toContain(
          'weights[1] must be a `tuple` type, but the final value was: `5`.'
        );
        expect(res.body.errors).toContain(
          'weights[2][0] must be a `string` type, but the final value was: `1`.'
        );
      }
    );

    it('should respond with 400 bad request, if validation fails in the sub-attainment level',
      async () => {
        // Validate on level 1
        let res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/4/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'tag-for-bad-input',
                daysValid: badInput,
                subAttainments: [],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 2
        res = await request
          .post('/v1/courses/3/assessment-models/4/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'test-ex-1-1',
                daysValid: 30,
                subAttainments: [
                  {
                    name: 'Exercise 1',
                    tag: 'test-ex-1-2',
                    daysValid: 30,
                    subAttainments: badInput,
                  }
                ],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 3
        res = await request
          .post('/v1/courses/1/assessment-models/1/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'test-ex-1-3',
                daysValid: 30,
                subAttainments: [
                  {
                    name: 'Exercise 1',
                    tag: 'test-ex-1-4',
                    daysValid: 30,
                    subAttainments: [
                      {
                        name: 'Exercise 1',
                        tag: 'test-ex-1-5',
                        daysValid: badInput,
                        subAttainments: [],
                      }
                    ],
                  }
                ],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .post('/v1/courses/1/assessment-models/1/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/3/assessment-models/3/attainments')
        .send({
          parentId: 3,
          ...mockAttainment
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if assessment model does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/assessment-models/${badId}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`assessment model with ID ${badId} not found`);
      });

    it('should respond with 404 not found, if course does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/${badId}/assessment-models/1/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`course with ID ${badId} not found`);
      });

    it('should respond with 409 conflict, if assessment model does not belong to the course',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models/2/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          'assessment model with ID 2 does not belong to the course with ID 1'
        );
      });

    it('should respond with 409 conflict, if assessment model already has root attainment',
      async () => {
        const attainment: Attainment = await Attainment.findOne({
          where: {
            assessmentModelId: 31,
            parentId: {
              [Op.is]: undefined
            }
          }
        }) as Attainment;

        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models/31/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `assessment model already has root attainment with ID ${attainment.id}`
        );
      });

    it(
      'should respond with 409 conflict, if parent attainment does not'
      + ' belong to the assessment model',
      async () => {
        // Try to add new attainment with previously created parent to assessment model 2.
        const res: supertest.Response = await request
          .post('/v1/courses/4/assessment-models/6/attainments')
          .send({ parentId: 4, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `parent attainment ID ${4} does not belong to the assessment model ID 6`
        );
      }
    );

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models/1/attainments')
          .send({ parentId: badId, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.UnprocessableEntity);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`attainment with ID ${badId} not found`);
      });

  });

describe(
  'Test PUT /v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId'
  + ' - update attainment information',
  () => {
    let subAttainment: AttainmentData;
    let parentAttainment: AttainmentData;

    it('should update field succesfully on an existing attainment (admin user)', async () => {
      // Create a new attainments.
      let res: supertest.Response = await request
        .post('/v1/courses/1/assessment-models/12/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      subAttainment = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainment.id}`)
        .send({
          name: 'new name',
          tag: 'new tag',
          daysValid: 50
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainment.id);
      expect(res.body.data.attainment.assessmentModelId).toBe(12);
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.name).toBe('new name');
      expect(res.body.data.attainment.tag).toBe('new tag');
      expect(res.body.data.attainment.formula).toBe(Formula.WeightedAverage);
      expect(res.body.data.attainment.daysValid).toBe(50);
    });

    it('should add parent succesfully on an existing attainment (teacher in charge)', async () => {
      // Set the number 2 child of mockAttainment as the parent of number 1 child.
      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      const subAttainments: Array<AttainmentData> =
        subAttainment.subAttainments as Array<AttainmentData>;

      const res: supertest.Response = await request
        .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainments[0].id}`)
        .send({ parentId: subAttainments[1].id })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainments[0].id);
      expect(res.body.data.attainment.assessmentModelId).toBe(12);
      expect(res.body.data.attainment.parentId).toBe(subAttainments[1].id);
    });

    it('should respond with 400 bad request, if validation fails (non-number assessment model id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/assessment-models/${badInput}/attainments/${subAttainment.id}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number course id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/${badInput}/assessment-models/1/attainments/${subAttainment.id}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number attainment ID)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/2/assessment-models/11/attainments/${badInput}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if formula params are incorrect',
      async () => {
        const res: supertest.Response = await request
          .put('/v1/courses/1/assessment-models/1/attainments/5')
          .send({
            formula: Formula.WeightedAverage,
            formulaParams: {}
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain('weights is a required field');
      }
    );

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .put('/v1/courses/2/assessment-models/11/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      jest.spyOn(Attainment, 'findByPk').mockResolvedValueOnce(jestMockAttainment);

      const res: supertest.Response = await request
        .put('/v1/courses/4/assessment-models/7/attainments/1')
        .send({
          name: 'new name 2',
          tag: 'new tag 2',
          daysValid: 51
        })
        .set('Cookie', cookies.userCookie)
        .expect(HttpCode.Forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if attainment does not exist', async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/2/assessment-models/11/attainments/${badId}`)
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`attainment with ID ${badId} not found`);
    });

    it(
      'should respond with 409 conflict, if parent attainment belongs to'
      + ' a different assessment model',
      async () => {
        // Create a new parent attainment on a different assessment model.
        let res: supertest.Response = await request
          .post('/v1/courses/4/assessment-models/13/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Ok);

        parentAttainment = res.body.data.attainment;

        res = await request
          .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainment.id}`)
          .send({ parentId: parentAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `parent attainment ID ${parentAttainment.id} does not belong ` +
        `to the same assessment model as attainment ID ${subAttainment.id}`
        );
      });

    it('should respond with 409 conflict, if attainment tries to refer itself in the parent ID',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainment.id}`)
          .send({ ...subAttainment, parentId: subAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe('attainment cannot refer to itself in the parent ID');
      });

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainment.id}`)
          .send({ parentId: badId })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.UnprocessableEntity);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`attainment with ID ${badId} not found`);
      });

  });

describe(
  'Test DELETE '
  + '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  () => {
    async function testAttainmentTreeDeletion(
      tree: object, courseId: number, assessmentModelId: number
    ): Promise<void> {
      // Add an attainment tree.
      const add: supertest.Response = await request
        .post(`/v1/courses/${courseId}/assessment-models/${assessmentModelId}/attainments`)
        .send(tree)
        .set('Cookie', cookies.adminCookie);

      // Adds the IDs of all subattainemnts of the given tree to the given
      // attainments array.
      function findSubattainmentIds(tree: AttainmentNode, attainments: Array<number>): void {
        for (const leaf of tree.subAttainments) {
          attainments.push(leaf.id);
          findSubattainmentIds(leaf, attainments);
        }
      }

      // Find the IDs of all the added attainments.
      const rootAttainment: number = add.body.data.attainment.id;
      const addedAttainments: Array<number> = [rootAttainment];
      findSubattainmentIds(add.body.data.attainment, addedAttainments);

      // Verify that the attainments were added.
      for (const addedAttainment of addedAttainments)
        expect(await Attainment.findByPk(addedAttainment)).not.toBeNull;

      // Delete the root attainment.
      const res: supertest.Response = await request
        .delete(
          `/v1/courses/${courseId}/assessment-models/` +
          `${assessmentModelId}/attainments/${rootAttainment}`
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the root attainment as well as all of its subattainments
      // were deleted.
      expect(res.body.success).toBe(true);
      for (const addedAttainment of addedAttainments)
        expect(await Attainment.findByPk(addedAttainment)).toBeNull;
    }

    it('should succesfully delete single attainment (admin user)', async () => {
      // Add an attainment.
      const add: supertest.Response = await request
        .post('/v1/courses/8/assessment-models/37/attainments')
        .send(
          {
            name: 'Test exercise',
            tag: 'delete-test-1',
            daysValid: 30,
            subAttainments: []
          }
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      // Verify that the attainment was added.
      const addedAttainmenId: number = add.body.data.attainment.id;
      expect(await Attainment.findByPk(addedAttainmenId)).not.toBeNull;

      // Delete the added attainment.
      const res: supertest.Response = await request
        .delete(`/v1/courses/8/assessment-models/37/attainments/${addedAttainmenId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the attainment was deleted.
      expect(res.body.success).toBe(true);
      expect(await Attainment.findByPk(addedAttainmenId)).toBeNull;
    });

    it('should succesfully delete single attainment (teacher in charge)', async () => {
      // Add an attainment.
      const add: supertest.Response = await request
        .post('/v1/courses/8/assessment-models/38/attainments')
        .send(
          {
            name: 'Test exercise 2',
            tag: 'delete-test-2',
            daysValid: 30,
            subAttainments: []
          }
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      // Verify that the attainment was added.
      const addedAttainmentid: number = add.body.data.attainment.id;
      expect(await Attainment.findByPk(addedAttainmentid)).not.toBeNull;

      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      // Delete the added attainment.
      const res: supertest.Response = await request
        .delete(`/v1/courses/8/assessment-models/38/attainments/${addedAttainmentid}`)
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the attainment was deleted.
      expect(res.body.success).toBe(true);
      expect(await Attainment.findByPk(addedAttainmentid)).toBeNull;
    });

    it('should succesfully delete a tree of attainments with depth 1', async () => {
      await testAttainmentTreeDeletion(
        {
          name: 'Test exercise',
          tag: 'delete-test-2',
          daysValid: 30,
          subAttainments: [
            {
              name: 'Test exercise 1.1',
              tag: 'delete-test-2-1.1',
              daysValid: 60,
              subAttainments: []
            },
            {
              name: 'Test exercise 1.2',
              tag: 'delete-test-2-1.2',
              daysValid: 90,
              subAttainments: []
            }
          ]
        }, 8, 39
      );
    });

    it('should succesfully delete a tree of attainments with depth greater than 1', async () => {
      await testAttainmentTreeDeletion(mockAttainment, 8, 40);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .delete('/v1/courses/4/assessment-models/7/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      jest.spyOn(Attainment, 'findByPk').mockResolvedValueOnce(jestMockAttainment);

      const res: supertest.Response = await request
        .delete('/v1/courses/4/assessment-models/7/attainments/1')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found for non-existent attainment ID', async () => {
      const res: supertest.Response = await request
        .delete(`/v1/courses/4/assessment-models/7/attainments/${badId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
    });

  }
);
