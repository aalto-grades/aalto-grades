// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';

import { addAssignment, updateAssignment } from '../controllers/courseAssignment';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   CreateAssignment:
 *     type: object
 *     description: Assignment Information for creating an assignment.
 *     properties:
 *       courseInstanceId:
 *         type: number
 *         description: Course instance id to which the assignment belongs to.
 *       name:
 *         type: string
 *         description: Assignment name.
 *       executionDate:
 *         type: string
 *         description: Date when the assignment is completed (e.g. deadline date or exam date).
 *       expiryDate:
 *         type: string
 *         description: Date when the assignment expires.
 *   Assignment:
 *     description: Existing assignment Information.
 *     allOf:
 *       - type: object
 *         properties:
 *           id:
 *             type: number
 *             description: Newly created assignment ID in the database.
 *       - $ref: '#/definitions/CreateAssignment'
 */

/**
 * @swagger
 * /v1/assignment:
 *   post:
 *     tags: [Assignment]
 *     description: Add a new assignment.
 *     requestBody:
 *       description: New assignment data.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/CreateAssignment'
 *     responses:
 *       200:
 *         description: Assignment created succesfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Assignment'
 *       400:
 *         description: Creation failed, due to malformed/missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/assignment',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAssignment)
);

/**
 * @swagger
 * /v1/assignment/{assignmentId}:
 *   put:
 *     tags: [Assignment]
 *     description: Update existing assignment.
 *     requestBody:
 *       description:  Assignment data to be updated.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Assignment'
 *     responses:
 *       200:
 *         description: Updated assignment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Assignment'
 *       400:
 *         description: Creation failed, due to malformed/missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.put(
  '/v1/assignment/:assignmentId',
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAssignment)
);
