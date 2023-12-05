// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Router} from 'express';
import passport from 'passport';

import {getFormula, getFormulas} from '../controllers/formula';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/formulas',
  passport.authenticate('jwt', {session: false}),
  getFormulas
);

router.get(
  '/v1/formulas/:formulaId',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getFormula)
);
