import express, { Router } from "express";
import { calculateGrades } from "../controllers/grades";
import { handleInvalidRequestJson } from "../middleware";
import { controllerDispatcher } from "../middleware/errorHandler";

export const router: Router = Router();

/**
 * @swagger
 * /v1/courses/{courseId}/instances/{instanceId}/grades/calculate:
 *   post:
 *     tags: [Attainment]
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
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(calculateGrades)
);
