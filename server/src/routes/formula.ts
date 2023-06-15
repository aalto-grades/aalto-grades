// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import { getFormula, getFormulas } from '../controllers/formula';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

/**
 * @swagger
 * definitions:
 *   FormulaData:
 *     type: object
 *     description: Students final grade d1ata.
 *     properties:
 *       id:
 *         type: string
 *         description: Enum value identifying the grading formula.
 *         example: WEIGHTED_AVERAGE
 *       name:
 *         type: string
 *         description: Name of the formula.
 *         example: Weighted average
 *   FormulaPreview:
 *     type: object
 *     description: Students final grade data.
 *     properties:
 *       id:
 *         type: string
 *         description: Enum value identifying the grading formula.
 *         example: WEIGHTED_AVERAGE
 *       name:
 *         type: string
 *         description: Name of the formula.
 *         example: Weighted average
 *       attributes:
 *         type: array
 *         description: Array of strings for all the attributes.
 *         example: ['maxPoints', 'minRequiredPoints', 'weight']
 *       codeSnippet:
 *         type: string
 *         description: String of the code.
 */

/**
 * @swagger
 * /v1/formulas:
 *   get:
 *     tags: [Formula]
 *     description: Returns name and enum of available formulas.
 *     responses:
 *       200:
 *         description: All available formulas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     formulas:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/FormulaData'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 */
router.get(
  '/v1/formulas',
  passport.authenticate('jwt', { session: false }),
  getFormulas
);

/**
 * @swagger
 * /v1/formulas/:formulaId:
 *   get:
 *     tags: [Formula]
 *     description: Returns all data of a formula based on its ID.
 *     parameters:
 *       formulaId:
 *         type: string
 *         description: Enum value identifying the grading formula.
 *         example: WEIGHTED_AVERAGE
 *     responses:
 *       200:
 *         description: Data of the formula.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Success of the request.
 *                 data:
 *                   type: object
 *                   properties:
 *                     formula:
 *                       $ref: '#/definitions/FormulaPreview'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       404:
 *         description: Formula not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Failure'
 */
router.get(
  '/v1/formulas/:formulaId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getFormula)
);
