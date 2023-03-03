// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import { addAttainable, updateAttainable } from '../controllers/attainable';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   AddAttainment:
 *     type: object
 *     description: Information for adding a new study attainment.
 *     properties:
 *       parentId:
 *         type: number
 *         required: false
 *         description: Optional parent attainment ID to which the study attainment belongs to.
 *       name:
 *         type: string
 *         required: true
 *         description: Study attainment name.
 *       date:
 *         type: string
 *         required: true
 *         description: Date when the attainment is completed (e.g. deadline date or exam date).
 *       expiryDate:
 *         type: string
 *         required: true
 *         description: >
 *           Date when the attainment expires. Once an attainment has expired, it is no longer
 *           eligible to count as completion for future course instances.
 *   Attainment:
 *     description: Study attainment information.
 *     allOf:
 *       - type: object
 *         properties:
 *           id:
 *             type: number
 *             required: true
 *             description: Study attainment ID.
 *           courseId:
 *             type: number
 *             required: true
 *             description: Course ID to which the study attainment belongs to.
 *           courseInstanceId:
 *             type: number
 *             required: true
 *             description: Course instance ID to which the study attainment belongs to.
 *       - $ref: '#/definitions/AddAttainment'
 */

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments:
 *   post:
 *     tags: [Attainment]
 *     description: Add a new study attainment.
 *     requestBody:
 *       description: New study attainment data.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AddAttainment'
 *     responses:
 *       200:
 *         description: New study attainment added succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Attainment'
 *       400:
 *         description: Creation failed, due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
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
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/attainments',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAttainable)
);

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/attainments/{attainmentId}:
 *   put:
 *     tags: [Attainment]
 *     description: Update existing study attainment.
 *     requestBody:
 *       description: Study attainment data to be updated.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Attainment'
 *     responses:
 *       200:
 *         description: Study attainment updated succesfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Attainment'
 *       400:
 *         description: Creation failed, due to validation errors or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: The given study attainment or the parent attainment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.put(
  '/v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAttainable)
);
