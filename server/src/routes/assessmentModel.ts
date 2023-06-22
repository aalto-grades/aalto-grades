// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import { getAssessmentModel } from '../controllers/assessmentModel';
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
 *           A course instance with the given ID was found and information
 *           about it is returned in the CourseInstanceData format.
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
 *                     courseInstance:
 *                       $ref: '#/definitions/AssessmentModelData'
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
