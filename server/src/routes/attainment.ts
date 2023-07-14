// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import {
  addAttainment,
  deleteAttainment,
  updateAttainment,
  getRootAttainment,
  getAttainment
} from '../controllers/attainment';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   AttainmentId:
 *     type: integer
 *     description: Internal attainment database ID.
 *     format: int32
 *     minimum: 1
 *     example: 32
 *   AssessmentModelId:
 *     type: integer
 *     description: Internal assessment model database ID.
 *     format: int32
 *     minimum: 1
 *     example: 32
 *   AttainmentTag:
 *     type: string
 *     description: A unique user-facing identifier for an attainment.
 *     example: a-plus-exercise-1.2
 *   AddAndEditAttainment:
 *     type: object
 *     description: >
 *       Information for adding new study attainments and subattainment(s).
 *     properties:
 *       parentId:
 *         type: integer
 *         required: false
 *         nullable: true
 *         description: >
 *           (Optional) Parent attainment ID to which the study attainment
 *           belongs to.
 *         example: 1
 *       name:
 *         type: string
 *         required: true
 *         description: Study attainment name.
 *         example: Exam attainment 1.1
 *       tag:
 *         $ref: '#/definitions/AttainmentTag'
 *       daysValid:
 *         type: integer
 *         required: true
 *         description: >
 *           How many days a completion of the attainment is valid for. Once
 *           a grade has expired, it is no longer eligible to count as
 *           completion for future course instances.
 *         example: 365
 *       subAttainments:
 *         type: array
 *         required: false
 *         nullable: true
 *         description: Sublevel attainment.
 *   Attainment:
 *     description: Study attainment information.
 *     allOf:
 *       - type: object
 *         properties:
 *           id:
 *             $ref: '#/definitions/AttainmentId'
 *           assessmentModelId:
 *             $ref: '#/definitions/AssessmentModelId'
 *       - $ref: '#/definitions/AddAndEditAttainment'
 */

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/attainments/{attainmentId}:
 *  get:
 *     tags: [Attainment]
 *     description: Get a single attainment or subtree downwards.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/attainmentId'
 *       - $ref: '#/components/parameters/tree'
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Attainment'
 *       400:
 *         description: Malformed request due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: Attainment was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/attainments:
 *  get:
 *     tags: [Attainment]
 *     description: Get the root attainment of the assessment model or subtree downwards.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/tree'
 *     responses:
 *       200:
 *         description: A single attainment or tree fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Attainment'
 *       400:
 *         description: Malformed request due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: Root attainment for the course instance was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Conflict due to more than one attainments without parentId found for
 *           the course instance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getRootAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/attainments:
 *   post:
 *     tags: [Attainment]
 *     description: >
 *       Add a new study attainment and its possible
 *       subattainment(s) to an existing assessment model.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *     requestBody:
 *       description: New study attainment data.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AddAndEditAttainment'
 *     responses:
 *       200:
 *         description: New study attainment added succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     attainment:
 *                       $ref: '#/definitions/Attainment'
 *       400:
 *         description: Creation failed, due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Course or assessment model does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Assessment model does not belong to the course or
 *           parent study attainment does not belong to the assessment model.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: Parent study attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.post(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/attainments/{attainmentId}:
 *   put:
 *     tags: [Attainment]
 *     description: >
 *       Update existing study attainment.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/attainmentId'
 *     requestBody:
 *       description: Study attainment data to be updated.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AddAndEditAttainment'
 *     responses:
 *       200:
 *         description: Study attainment updated succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   $ref: '#/definitions/Attainment'
 *       400:
 *         description: Creation failed, due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: The given study attainment or the parent attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Parent study attainment does not belong to the assessment model or
 *           attainment tries to refer to itself as the parent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       422:
 *         description: Parent study attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/assessment-models/{assessmentModelId}/attainments/{attainmentId}:
 *   delete:
 *     tags: [Attainment]
 *     description: >
 *       Delete a study attainment and all of its subattainments.
 *       Available only to admin users and teachers in charge of the course.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/assessmentModelId'
 *       - $ref: '#/components/parameters/attainmentId'
 *     responses:
 *       200:
 *         description: >
 *           Study attainment and its possible subattainments were successfully
 *           deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   $ref: '#/definitions/Success'
 *                 data:
 *                   description: Empty data object.
 *                   type: object
 *       400:
 *         description: >
 *           A validation error occurred in the URL. Either the course ID,
 *           assessment model ID, or attainment ID is not a positive integer.
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
 *           The given course, assessment model, or study attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given assessment model does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.delete(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(deleteAttainment)
);
