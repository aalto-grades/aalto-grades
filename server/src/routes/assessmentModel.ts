// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import {
  addAssessmentModel, getAllAssessmentModels, getAssessmentModel
} from '../controllers/assessmentModel';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   AssessmentModelId:
 *     type: integer
 *     description: Internal assessment model database ID.
 *     format: int32
 *     minimum: 1
 *     example: 1
 *   AssessmentModelData:
 *     type: object
 *     description: Assessment model information.
 *     properties:
 *       id:
 *        $ref: '#/definitions/AssessmentModelId'
 *       courseId:
 *        $ref: '#/definitions/CourseId'
 *       name:
 *         type: string
 *         decription: Name of the assessment model.
 *         example: Exam model
 */

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}:
 *   get:
 *     tags: [Assessment Model]
 *     description: Get information about an assessment model.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *     responses:
 *       200:
 *         description: >
 *           An assessment model with the given ID was found and information
 *           about it is returned in the AssessmentModelData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/AssessmentModelData'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course
 *           or assessment model ID is not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           A course with the given course ID or an assessment model with the
 *           given assessment model ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The found assessment model with the given assessment model ID does
 *           not belong to the course with the given course ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAssessmentModel)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models:
 *   get:
 *     tags: [Assessment Model]
 *     description: Get information about all the assessment models of a course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     responses:
 *       200:
 *         description: >
 *           A course with the given ID was found and information about all of
 *           its assessment models, if any, are returned in the
 *           AssessmentModelData format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/AssessmentModelData'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course ID is
 *           not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           A course with the given course ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAllAssessmentModels)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models:
 *   post:
 *     tags: [Assessment Model]
 *     description: >
 *       Add an attainment model to a course.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the assessment model.
 *     responses:
 *       200:
 *         description: >
 *           The attainment model was added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/AssessmentModelId'
 *       400:
 *         description: >
 *           A validation error has occurred in the URL, the given course ID is
 *           not a positive integer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: >
 *           A course with the given course ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: Assessment model with same name already exists on the Course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAssessmentModel)
);
