// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, Formula, HttpCode, ParamsObject
} from 'aalto-grades-common/types';
import { Op } from 'sequelize';
import supertest from 'supertest';

import Attainment from '../../src/database/models/attainment';
import TeacherInCharge from '../../src/database/models/teacherInCharge';

import { mockAttainment, jestMockAttainment } from '../mock-data/attainment';
import { mockTeacher } from '../mock-data/misc';
import { app } from '../../src/app';
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

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, false);
    });

    it('should respond with a single attainment with one level of subattainments, '
      + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[0], 6, 2, false);
      verifyAttainmentData(res.body.data.subAttainments[1], 10, 2, false);
    });

    it('should respond with a single attainment with a full tree of subattainments, '
      + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[0], 6, 2, true);
      verifyAttainmentData(
        res.body.data.subAttainments[0].subAttainments[0],
        214,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data.subAttainments[0].subAttainments[0].subAttainments[0],
        215,
        2,
        false
      );
      verifyAttainmentData(res.body.data.subAttainments[1], 10, 2, false);
    });

    it('should respond with 400 Bad Request, if "tree" parameter in query string '
      + 'is invalid', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments/2?tree=fail')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

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

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 1, 1, true);
    });

    it('should respond with a single attainment with one level of subattainments, '
    + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[0], 6, 2, false);
      verifyAttainmentData(res.body.data.subAttainments[1], 10, 2, false);
    });

    it('should respond with a single attainment with a full tree of subattainments, '
    + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/assessment-models/2/attainments?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[0], 6, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[1], 10, 2, false);
      verifyAttainmentData(
        res.body.data.subAttainments[0].subAttainments[0],
        214,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data.subAttainments[0].subAttainments[0].subAttainments[0],
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

        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.name).toBe('New');
        expect(res.body.data.assessmentModelId).toBe(31);
        expect(res.body.data.parentId).not.toBeDefined();
        expect(res.body.data.tag).toBe('tag of the new one');
        expect(res.body.data.formula).toBe(Formula.Manual);
        expect(res.body.data.formulaParams).toBe(null);
        expect(res.body.data.daysValid).toBeDefined();
        expect(res.body.data.subAttainments).toBeDefined();
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

        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.name).toBe('examination');
        expect(res.body.data.assessmentModelId).toBe(35);
        expect(res.body.data.parentId).not.toBeDefined();
        expect(res.body.data.tag).toBe('tag123456');
        expect(res.body.data.formula).toBe(Formula.Manual);
        expect(res.body.data.formulaParams).toBe(null);
        expect(res.body.data.daysValid).toBeDefined();
        expect(res.body.data.subAttainments).toBeDefined();
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

        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.assessmentModelId).toBe(32);
        expect(res.body.data.name).toBe(mockAttainment.name);
        expect(res.body.data.parentId).not.toBeDefined();
        expect(res.body.data.tag).toBeDefined();
        expect(res.body.data.formula).toBeDefined();
        expect(res.body.data.daysValid).toBeDefined();
        expect(res.body.data.subAttainments).toBeDefined();

        for (const subAttainment of res.body.data.subAttainments) {
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

      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.parentId).toBe(3);

      for (const subAttainment of res.body.data.subAttainments) {
        evaluateSubAttainment(subAttainment);
      }
    });

    it(
      'should update the children array of a parent attainment\'s parameters'
      + ' with the tag of a new attainment',
      async () => {
        let parent: Attainment = await Attainment.findByPk(264) as Attainment;
        expect(parent.formulaParams).toBeDefined();
        const oldParentParams: ParamsObject = parent.formulaParams as ParamsObject;
        expect(oldParentParams.children).not.toContainEqual(['born', { weight: 0 }]);

        await request
          .post('/v1/courses/3/assessment-models/3/attainments')
          .send({
            parentId: 264,
            tag: 'born',
            name: 'Born again',
            daysValid: 10
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        parent = await Attainment.findByPk(264) as Attainment;
        expect(parent.formulaParams).toBeDefined();
        const newParentParams: ParamsObject = parent.formulaParams as ParamsObject;
        expect(newParentParams.children).toContainEqual(['born', { weight: 0 }]);

        expect(oldParentParams).not.toStrictEqual(newParentParams);
        expect(oldParentParams.children).not.toStrictEqual(newParentParams.children);

        expect({ ...oldParentParams, children: undefined })
          .toStrictEqual({ ...newParentParams, children: undefined });
        expect([...oldParentParams.children, ['born', { weight: 0 }]])
          .toStrictEqual(newParentParams.children);
      }
    );

    it('should respond with 400 bad request, if validation fails (non-number assessment model id)',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/assessment-models/${badInput}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

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
              minRequiredGrade: 5,
              children: [
                ['sub not success', { weight: 1 }]
              ]
            },
            subAttainments: [
              {
                name: 'Subfailure',
                tag: 'sub not success',
                daysValid: 6,
                formula: Formula.WeightedAverage,
                formulaParams: {
                  children: [
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

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'children[0] must be a `tuple` type, but the final value was: `"wrong again"`.'
        );
        expect(res.body.errors).toContain(
          'children[1] must be a `tuple` type, but the final value was: `5`.'
        );
        expect(res.body.errors).toContain(
          'children[2][0] must be a `string` type, but the final value was: `1`.'
        );
        expect(res.body.errors).toContain(
          'children[2][1] must be a `object` type, but the final value was: `-1`.'
        );
      }
    );

    it(
      'should respond with 400 bad request, if formula params are missing a child',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/3/attainments')
          .send({
            parentId: 3,
            name: 'Failure',
            tag: 'missing child',
            daysValid: 1,
            formula: Formula.WeightedAverage,
            formulaParams: {
              minRequiredGrade: 10,
              children: [
                ['i-am-present', { weight: 1 }]
              ]
            },
            subAttainments: [
              {
                name: 'Present',
                tag: 'i-am-present',
                daysValid: 1,
                formula: Formula.Manual
              },
              {
                name: 'Absent',
                tag: 'i-am-absent',
                daysValid: 0,
                formula: Formula.Manual
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'formula params do not include subattainments with tags i-am-absent'
        );
      }
    );

    it(
      'should respond with 400 bad request, if formula params include an invalid tag',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/3/assessment-models/3/attainments')
          .send({
            parentId: 3,
            name: 'Failure',
            tag: 'invalid tag',
            daysValid: 1,
            formula: Formula.WeightedAverage,
            formulaParams: {
              minRequiredGrade: 15,
              children: [
                ['the good', { weight: 1 }],
                ['the bad', { weight: 2 }],
                ['the ugly', { weight: 3 }]
              ]
            },
            subAttainments: [
              {
                name: 'I exist',
                tag: 'the good',
                daysValid: 1,
                formula: Formula.Manual
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'invalid subattainment tags in formula params: the bad,the ugly'
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

      subAttainment = res.body.data;

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

      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.id).toBe(subAttainment.id);
      expect(res.body.data.assessmentModelId).toBe(12);
      expect(res.body.data.parentId).toBe(null);
      expect(res.body.data.name).toBe('new name');
      expect(res.body.data.tag).toBe('new tag');
      expect(res.body.data.formula).toBe(Formula.WeightedAverage);
      expect(res.body.data.daysValid).toBe(50);
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

      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.id).toBe(subAttainments[0].id);
      expect(res.body.data.assessmentModelId).toBe(12);
      expect(res.body.data.parentId).toBe(subAttainments[1].id);
    });

    it(
      'should update the formula params of a potential parent attainment with'
      + ' a new attainment tag if it is changed in a child',
      async () => {
        let attainment: Attainment | null = await Attainment.findByPk(258);
        let parentParams: ParamsObject = attainment?.formulaParams as ParamsObject;

        expect(parentParams.children).toContainEqual(['259', { weight: 1 }]);
        expect(parentParams.children).toContainEqual(['260', { weight: 1 }]);

        const res: supertest.Response = await request
          .put('/v1/courses/2/assessment-models/43/attainments/259')
          .send({ tag: 'changed tag' })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Ok);

        expect(res.body.data).toBeDefined();
        expect(res.body.errors).not.toBeDefined();

        attainment = await Attainment.findByPk(258);
        parentParams = attainment?.formulaParams as ParamsObject;

        expect(parentParams.children).not.toContainEqual(['259', { weight: 1 }]);
        expect(parentParams.children).toContainEqual(['changed tag', { weight: 1 }]);
        expect(parentParams.children).toContainEqual(['260', { weight: 1 }]);
      }
    );

    it(
      'should remove the edited attainment from the old parent attainment\'s and'
      + ' add it to the new parent attainment\'s params',
      async () => {
        let oldParent: Attainment | null = await Attainment.findByPk(261);
        let oldParentParams: ParamsObject = oldParent?.formulaParams as ParamsObject;
        let newParent: Attainment | null = await Attainment.findByPk(263);
        let newParentParams: ParamsObject = newParent?.formulaParams as ParamsObject;

        expect(oldParentParams.children).toContainEqual(['262', { weight: 1 }]);
        expect(oldParentParams.children).toContainEqual(['263', { weight: 1 }]);
        expect(newParentParams.children).not.toContainEqual(['262', { weight: 0 }]);

        const res: supertest.Response = await request
          .put('/v1/courses/2/assessment-models/44/attainments/262')
          .send({ parentId: 263 })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Ok);

        expect(res.body.data).toBeDefined();
        expect(res.body.errors).not.toBeDefined();

        oldParent = await Attainment.findByPk(261);
        oldParentParams = oldParent?.formulaParams as ParamsObject;
        newParent = await Attainment.findByPk(263);
        newParentParams = newParent?.formulaParams as ParamsObject;

        expect(oldParentParams.children).not.toContainEqual(['262', { weight: 1 }]);
        expect(oldParentParams.children).toContainEqual(['263', { weight: 1 }]);
        expect(newParentParams.children).toContainEqual(['262', { weight: 0 }]);
      }
    );

    it('should respond with 400 bad request, if validation fails (non-number assessment model id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/assessment-models/${badInput}/attainments/${subAttainment.id}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

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

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if formula params are incorrect',
      async () => {
        const res: supertest.Response = await request
          .put('/v1/courses/1/assessment-models/1/attainments/1')
          .send({
            formula: Formula.WeightedAverage,
            formulaParams: {}
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain('children is a required field');
      }
    );

    it(
      'should respond with 400 bad request, if formula params are missing a child',
      async () => {
        const res: supertest.Response = await request
          .put('/v1/courses/1/assessment-models/1/attainments/1')
          .send({
            formulaParams: {
              minRequiredGrade: 15,
              children: [
                ['tag5', { weight: 5 }],
                ['tag16', { weight: 16 }]
              ]
            }
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'formula params do not include subattainments with tags tag9,tag17,tag18'
        );
      }
    );

    it(
      'should respond with 400 bad request, if formula params include an invalid tag',
      async () => {
        const res: supertest.Response = await request
          .put('/v1/courses/1/assessment-models/1/attainments/1')
          .send({
            formulaParams: {
              minRequiredGrade: 15,
              children: [
                ['tag5', { weight: 5 }],
                ['tag9', { weight: 9 }],
                ['tag16', { weight: 16 }],
                ['tag17', { weight: 17 }],
                ['tag18', { weight: 18 }],
                ['invalid', { weight: 1 }],
                ['invalid too', { weight: 2 }]
              ]
            }
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
        expect(res.body.errors).toContain(
          'invalid subattainment tags in formula params: invalid,invalid too'
        );
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

        parentAttainment = res.body.data;

        res = await request
          .put(`/v1/courses/1/assessment-models/12/attainments/${subAttainment.id}`)
          .send({ parentId: parentAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Conflict);

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
      const rootAttainment: number = add.body.data.id;
      const addedAttainments: Array<number> = [rootAttainment];
      findSubattainmentIds(add.body.data, addedAttainments);

      // Verify that the attainments were added.
      for (const addedAttainment of addedAttainments)
        expect(await Attainment.findByPk(addedAttainment)).not.toBeNull;

      // Delete the root attainment.
      await request
        .delete(
          `/v1/courses/${courseId}/assessment-models/` +
          `${assessmentModelId}/attainments/${rootAttainment}`
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the root attainment as well as all of its subattainments
      // were deleted.
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
      const addedAttainmenId: number = add.body.data.id;
      expect(await Attainment.findByPk(addedAttainmenId)).not.toBeNull;

      // Delete the added attainment.
      await request
        .delete(`/v1/courses/8/assessment-models/37/attainments/${addedAttainmenId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the attainment was deleted.
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
      const addedAttainmentid: number = add.body.data.id;
      expect(await Attainment.findByPk(addedAttainmentid)).not.toBeNull;

      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      // Delete the added attainment.
      await request
        .delete(`/v1/courses/8/assessment-models/38/attainments/${addedAttainmentid}`)
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the attainment was deleted.
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

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found for non-existent attainment ID', async () => {
      await request
        .delete(`/v1/courses/4/assessment-models/7/attainments/${badId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);
    });

  }
);
