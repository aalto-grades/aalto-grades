// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import { calculateGrades } from '../controllers/grades';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/* @swagger
 * definitions:
 *   Grades:
 *     description: Calculated final grades for each student.
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         studentId:
 *           type: number
 *           description: Student database identifier.
 *         grade:
 *           type: number
 *           description: Final grade of the student.
 *         status:
 *           type: string
 *           description: >
 *             'pass' or 'fail' to indicate whether the attainment has been
 *              successfully completed.
 */

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/calculate:
 *   post:
 *     tags: [Grades]
 *     description: >
 *       Calculate and get the final grades of all students.
 *       [ANTI-BIKESHEDDING PLACEHOLDER]
 *     requestBody:
 *       description: The request body should be empty.
 *     responses:
 *       200:
 *         description: Grades calculated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Grades'
 *       400:
 *         description: >
 *           Calculation failed, due to validation errors or missing parameters.
 *           This may also indicate a cycle in the hierarchy of attainables.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 *       404:
 *         description: The given course or course instance does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.post(
  '/v1/courses/:courseId/instances/:instanceId/grades/calculate',
  controllerDispatcher(calculateGrades)
);
