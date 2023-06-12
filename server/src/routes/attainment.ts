// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import {
  addAttainment,
  deleteAttainment,
  updateAttainment,
  getAttainment,
  getAllAttainments
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
 *   AddAndEditAttainment:
 *     type: object
 *     description: Information for adding a new study attainment and its subattainment(s).
 *     properties:
 *       parentId:
 *         type: integer
 *         required: false
 *         nullable: true
 *         description: (Optional) Parent attainment ID to which the study attainment belongs to.
 *         example: 1
 *       name:
 *         type: string
 *         required: true
 *         description: Study attainment name.
 *         example: Exam attainment 1.1
 *       date:
 *         type: string
 *         format: date
 *         required: true
 *         description: Date when the attainment is completed (e.g. deadline date or exam date).
 *         example: 2023-7-24
 *       expiryDate:
 *         type: string
 *         format: date
 *         required: true
 *         description: >
 *           Date when the attainment expires. Once an attainment has expired, it is no longer
 *           eligible to count as completion for future course instances.
 *         example: 2023-12-24
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
 *           courseId:
 *             $ref: '#/definitions/CourseId'
 *           courseInstanceId:
 *             $ref: '#/definitions/CourseInstanceId'
 *           tag:
 *             type: string
 *             description: Tag formed from course (C), instance (I) and attainment (A) IDs.
 *             example: C1I1A32
 *       - $ref: '#/definitions/AddAndEditAttainment'
 */

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments:
 *   post:
 *     tags: [Attainment]
 *     description: >
 *       Add a new study attainment and its possible
 *       subattainment(s) to an existing course instance.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
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
 *         description: Course or course instance does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           Course instance does not belong to the course or
 *           parent study attainment does not belong to the course instance.
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
  '/v1/courses/:courseId/instances/:instanceId/attainments',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments/{attainmentId}:
 *   delete:
 *     tags: [Attainment]
 *     description: Delete a study attainment and all of its subattainments.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *       - $ref: '#/components/parameters/attainmentId'
 *     responses:
 *       200:
 *         description: Study attainment and its possible subattainments were successfully deleted.
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
 *           instance ID, or attainment ID is not a positive integer.
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
 *           The given course, course instance, or study attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       409:
 *         description: >
 *           The given course instance does not belong to the given course.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *     security:
 *       - cookieAuth: []
 */
router.delete(
  '/v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(deleteAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments/{attainmentId}:
 *   put:
 *     tags: [Attainment]
 *     description: Update existing study attainment.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
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
 *           Parent study attainment does not belong to the course instance or
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
  '/v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments/{attainmentId}:
 *  get:
 *     tags: [Attainment]
 *     description: Get single attainment or subtree downwards.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
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
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description:
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
  '/v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAttainment)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments:
 *  get:
 *     tags: [Attainment]
 *     description: Get all root attainments of the course instance or subtree downwards.
 *     parameters:
 *       - $ref: '#/components/parameters/courseId'
 *       - $ref: '#/components/parameters/instanceId'
 *       - $ref: '#/components/parameters/tree'
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Attainment'
 *       400:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description:
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
  '/v1/courses/:courseId/instances/:instanceId/attainments',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAllAttainments)
);
