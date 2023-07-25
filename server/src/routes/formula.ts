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
 *     description: Basic information about a formula.
 *     properties:
 *       id:
 *         type: string
 *         description: Enum value identifying the grading formula.
 *         example: WEIGHTED_AVERAGE
 *       name:
 *         type: string
 *         description: Name of the formula.
 *         example: Weighted average
 *   FormulaDetails:
 *     type: object
 *     description: Detailed information of formula based on its ID.
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
 *         description: Grading formula code in string format.
 */

/**
 * @swagger
 * /v1/formulas:
 *   get:
 *     tags: [Formula]
 *     description: Returns name and enum of available formulas in an array.
 *     responses:
 *       200:
 *         description: All available formulas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/FormulaData'
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
 * /v1/formulas/{formulaId}:
 *   get:
 *     tags: [Formula]
 *     description: Returns all data of a formula based on its ID.
 *     parameters:
 *       - $ref: '#/components/parameters/formulaId'
 *     responses:
 *       200:
 *         description: Detailed data of the formula.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/FormulaDetails'
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
