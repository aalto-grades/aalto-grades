// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, Formula, HttpCode, ParamsObject
} from 'aalto-grades-common/types';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Attainment from '../database/models/attainment';
import Course from '../database/models/course';

import { getFormulaImplementation } from '../formulas';
import { ApiError, FormulaImplementation, idSchema, JwtClaims } from '../types';
import { validateAssessmentModelPath } from './utils/assessmentModel';
import {
  findAttainmentById, findAttainmentsByAssessmentModel, generateAttainmentTree,
  validateAttainmentPath
} from './utils/attainment';
import { isTeacherInChargeOrAdmin } from './utils/user';

async function validateFormulaParams(
  formula: Formula,
  formulaParams: ParamsObject,
  subAttainmentNames?: Array<string>
): Promise<void> {
  // Validate params with the formula's param schema
  await getFormulaImplementation(formula).paramSchema.validate(
    formulaParams, { abortEarly: false }
  );

  if (formulaParams.children) {
    // Ensure that all subattainments are included in children and that there
    // are no invalid subattainment names in children
    const uncheckedNamesInParams: Array<string> = formulaParams.children?.map(
      (value: [string, unknown]) => value[0]
    ) ?? [];

    const notFound: Array<string> = [];

    if (subAttainmentNames) {
      for (const name of subAttainmentNames) {
        const index: number = uncheckedNamesInParams.indexOf(name);
        if (index < 0) {
          notFound.push(name);
        } else {
          uncheckedNamesInParams.splice(index, 1);
        }
      }
    }

    if (notFound.length > 0) {
      throw new ApiError(
        `formula params do not include subattainments with names ${notFound}`,
        HttpCode.BadRequest
      );
    }

    if (uncheckedNamesInParams.length > 0) {
      throw new ApiError(
        `invalid subattainment names in formula params: ${uncheckedNamesInParams}`,
        HttpCode.BadRequest
      );
    }
  }
}

async function validateTreeParam(treeParam: string): Promise<string> {
  const treeSchema: yup.AnyObjectSchema = yup.object().shape({
    tree: yup.string().oneOf(['children', 'descendants'])
  }).noUnknown(true).strict();

  await treeSchema.validate({ tree: treeParam }, { abortEarly: false });
  return treeParam;
}

export async function getAttainment(req: Request, res: Response): Promise<void> {
  const tree: string = await validateTreeParam(req.query.tree as string);
  await idSchema.validate({ id: req.params.attainmentId }, { abortEarly: false });
  const attainmentId: number = Number(req.params.attainmentId);

  const [_course, assessmentModel, _attainment]: [Course, AssessmentModel, Attainment] =
    await validateAttainmentPath(
      req.params.courseId, req.params.assessmentModelId, req.params.attainmentId
    );

  const attainmentData: Array<AttainmentData> =
    await findAttainmentsByAssessmentModel(assessmentModel.id);

  const localRoot: AttainmentData | undefined = attainmentData.find(
    (attainment: AttainmentData) => attainment.id === attainmentId
  );

  if (!localRoot) {
    throw new ApiError(
      `attainment with ID ${attainmentId} not found`, HttpCode.NotFound
    );
  }

  switch (tree) {
  case 'children':
    generateAttainmentTree(localRoot, attainmentData, true);
    break;
  case 'descendants':
    generateAttainmentTree(localRoot, attainmentData);
    break;
  default:
    break;
  }

  res.status(HttpCode.Ok).json({
    data: localRoot
  });
}

export async function getRootAttainment(req: Request, res: Response): Promise<void> {
  const tree: string = await validateTreeParam(req.query.tree as string);

  const [_course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  const allAttainmentData: Array<AttainmentData> =
    await findAttainmentsByAssessmentModel(assessmentModel.id);

  const rootAttainments: Array<AttainmentData> = allAttainmentData.filter(
    (attainment: AttainmentData) => !attainment.parentId
  );

  if (rootAttainments.length === 0) {
    throw new ApiError(
      'Root attainment was not found for the specified course and assessment model.',
      HttpCode.NotFound
    );
  } else if (rootAttainments.length > 1) {
    throw new ApiError(
      'More than one attainment without parentId was found '
      + 'for the specified course and assessment model. Attainment IDs: '
      + rootAttainments.map((attainment: AttainmentData) => attainment.id).join(),
      HttpCode.Conflict
    );
  }

  switch (tree) {
  case 'children':
    generateAttainmentTree(rootAttainments[0], allAttainmentData, true);
    break;
  case 'descendants':
    generateAttainmentTree(rootAttainments[0], allAttainmentData);
    break;
  default:
    generateAttainmentTree(rootAttainments[0], allAttainmentData);
    break;
  }

  res.status(HttpCode.Ok).json({
    data: rootAttainments[0]
  });
}

export async function addAttainment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .required(),
    daysValid: yup
      .number()
      .min(0)
      .required(),
    formula: yup
      .string()
      .oneOf(Object.values(Formula))
      .required(),
    formulaParams: yup // More thorough validation is done separately
      .object()
      .required(),
    subAttainments: yup
      .array()
      .of(yup.lazy(() => requestSchema.default(undefined)))
      .notRequired()
  });

  await requestSchema.validate(req.body, { abortEarly: false });

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  const requestTree: AttainmentData = req.body;

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  // If linked to a parent ID ensure that the parent attainment exists and
  // belongs to the same assessment model
  if (requestTree.parentId) {
    const parentAttainment: Attainment = await findAttainmentById(
      requestTree.parentId, HttpCode.UnprocessableEntity
    );

    if (parentAttainment.assessmentModelId !== assessmentModel.id) {
      throw new ApiError(
        `parent attainment ID ${requestTree.parentId} does not belong ` +
        `to the assessment model ID ${assessmentModel.id}`,
        HttpCode.Conflict
      );
    }

    /*
     * If the parent attainment has formula params defined and the formula isn't
     * manual, then this new attainment must be added to the children list of the
     * parent attainment's params.
     */
    const parentParams: ParamsObject = parentAttainment.formulaParams;
    if (parentParams.children) {
      const parentFormula: FormulaImplementation = getFormulaImplementation(
        parentAttainment.formula
      );

      parentParams.children.push(
        [requestTree.name, parentFormula.defaultChildParams]
      );

      // Sanity check
      await parentFormula.paramSchema.validate(parentParams);

      await Attainment.update(
        {
          formulaParams: parentParams
        },
        {
          where: {
            id: requestTree.parentId
          }
        }
      );
    }
  } else {
    // Make sure that no other root attainments exist for the assessment model.
    const attainment: Attainment | null = await Attainment.findOne({
      where: {
        assessmentModelId: assessmentModel.id,
        parentId: {
          [Op.is]: undefined
        }
      }
    });

    // Root attainment exists.
    if (attainment) {
      throw new ApiError(
        `assessment model already has root attainment with ID ${attainment.id}`,
        HttpCode.Conflict
      );
    }
  }

  // Validate formula parameters for each attainment
  async function validateFormulaParamsTree(
    attainmentTree: AttainmentData
  ): Promise<void> {
    await validateFormulaParams(
      attainmentTree.formula,
      attainmentTree.formulaParams,
      attainmentTree.subAttainments?.map(
        (subAttainment: AttainmentData) => subAttainment.name
      )
    );

    if (attainmentTree.subAttainments) {
      for (const subTree of attainmentTree.subAttainments) {
        await validateFormulaParamsTree(subTree);
      }
    }
  }

  await validateFormulaParamsTree(req.body);

  // Add all attainments to the database and construct an attainment tree with
  // IDs to return
  async function processAttainmentTree(
    requestTree: AttainmentData, parentId: number | undefined
  ): Promise<AttainmentData> {

    const dbEntry: Attainment = await Attainment.create({
      parentId: parentId,
      assessmentModelId: assessmentModel.id,
      name: requestTree.name,
      daysValid: requestTree.daysValid,
      minRequiredGrade: 1,
      maxGrade: 5,
      formula: requestTree.formula,
      formulaParams: requestTree.formulaParams
    });

    const attainmentTree: AttainmentData = {
      id: dbEntry.id,
      parentId: dbEntry.parentId ?? undefined,
      assessmentModelId: dbEntry.assessmentModelId,
      name: dbEntry.name,
      daysValid: dbEntry.daysValid,
      minRequiredGrade: dbEntry.minRequiredGrade,
      maxGrade: dbEntry.maxGrade,
      formula: dbEntry.formula,
      formulaParams: dbEntry.formulaParams,
      subAttainments: []
    };

    if (requestTree.subAttainments) {
      for (const requestSubTree of requestTree.subAttainments) {
        attainmentTree.subAttainments?.push(
          await processAttainmentTree(requestSubTree, dbEntry.id)
        );
      }
    }

    return attainmentTree;
  }

  const attainmentTree: AttainmentData = await processAttainmentTree(
    requestTree, requestTree.parentId
  );

  res.status(HttpCode.Ok).json({
    data: attainmentTree
  });
}

export async function updateAttainment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .notRequired(),
    daysValid: yup
      .number()
      .min(0)
      .notRequired(),
    formula: yup.string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(Formula))
      .notRequired(),
    formulaParams: yup // More thorough validation is done later
      .object()
      .nullable()
      .notRequired(),
  });

  await requestSchema.validate(req.body, { abortEarly: false });

  const [course, _assessmentModel, attainment]: [Course, AssessmentModel, Attainment] =
    await validateAttainmentPath(
      req.params.courseId, req.params.assessmentModelId, req.params.attainmentId
    );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  const name: string | undefined = req.body.name;
  const daysValid: number | undefined = req.body.daysValid;
  const parentId: number | undefined = req.body.parentId;
  const formula: Formula | undefined = req.body.formula;
  const formulaParams: ParamsObject | undefined = req.body.formulaParams;

  let parentAttainment: Attainment | null = null;

  // If linked to a parent id, check that it exists and belongs
  // to the same assessment model as the attainment being edited.
  if (parentId) {

    // TODO: check that does not refer to itself transitionally through some other attainment.
    if (parentId === attainment.id) {
      throw new ApiError(
        'attainment cannot refer to itself in the parent ID',
        HttpCode.Conflict
      );
    }

    parentAttainment = await findAttainmentById(
      parentId,
      HttpCode.UnprocessableEntity
    );

    if (parentAttainment.assessmentModelId !== attainment.assessmentModelId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to ` +
        `the same assessment model as attainment ID ${attainment.id}`,
        HttpCode.Conflict
      );
    }
  }

  await validateFormulaParams(
    formula ?? attainment.formula,
    formulaParams ?? attainment.formulaParams,
    (await Attainment.findAll({
      attributes: ['name'],
      where: {
        parentId: attainment.id
      }
    })).map((attainment: { name: string }): string => attainment.name)
  );

  if (parentId && parentId !== attainment.parentId) {
    if (attainment.parentId) {
      const oldParent: Attainment = await findAttainmentById(
        attainment.parentId, HttpCode.InternalServerError
      );

      const parentParams: ParamsObject = oldParent.formulaParams;
      if (parentParams.children) {
        for (const i in parentParams.children) {
          if (parentParams.children[i][0] === attainment.name) {
            parentParams.children.splice(Number(i), 1);
            break;
          }
        }

        await Attainment.update(
          {
            formulaParams: parentParams
          },
          {
            where: {
              id: oldParent.id
            }
          }
        );
      }
    }

    const newParent: Attainment = await findAttainmentById(
      parentId, HttpCode.InternalServerError
    );

    const parentParams: ParamsObject = newParent.formulaParams;
    if (parentParams.children) {
      const parentFormula: FormulaImplementation = getFormulaImplementation(
        newParent.formula
      );

      parentParams.children.push(
        [name ?? attainment.name, parentFormula.defaultChildParams]
      );

      // Sanity check
      await parentFormula.paramSchema.validate(parentParams);

      await Attainment.update(
        {
          formulaParams: parentParams
        },
        {
          where: {
            id: newParent.id
          }
        }
      );
    }
  } else if (name && name !== attainment.name && attainment.parentId) {
    const parent: Attainment = await findAttainmentById(
      attainment.parentId, HttpCode.InternalServerError
    );


    const parentParams: ParamsObject = parent.formulaParams;
    if (parentParams.children) {
      for (const i in parentParams.children) {
        if (parentParams.children[i][0] === attainment.name) {
          parentParams.children[i][0] = name;
          break;
        }
      }

      await Attainment.update(
        {
          formulaParams: parentParams
        },
        {
          where: {
            id: parent.id
          }
        }
      );
    }
  }

  await attainment.set({
    name: name ?? attainment.name,
    daysValid: daysValid ?? attainment.daysValid,
    parentId: parentId ?? attainment.parentId,
    formula: formula ?? attainment.formula,
    formulaParams: formulaParams ?? attainment.formulaParams
  }).save();

  const attainmentTree: AttainmentData = {
    id: attainment.id,
    assessmentModelId: attainment.assessmentModelId,
    name: attainment.name,
    formula: attainment.formula,
    formulaParams: attainment.formulaParams as ParamsObject,
    daysValid: attainment.daysValid,
    minRequiredGrade: attainment.minRequiredGrade,
    maxGrade: attainment.maxGrade,
    parentId: attainment.parentId
  };

  res.status(HttpCode.Ok).json({
    data: attainmentTree
  });
}

export async function deleteAttainment(req: Request, res: Response): Promise<void> {
  // Get path parameters.
  const attainmentId: number = Number(req.params.attainmentId);

  // Validation.
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });

  const [course, _assessmentModel, attainment]: [Course, AssessmentModel, Attainment] =
    await validateAttainmentPath(
      req.params.courseId, req.params.assessmentModelId, req.params.attainmentId
    );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  // Delete the attainment if found from db. This automatically
  // also deletes all of the subattainments of this attainment.
  attainment.destroy();

  res.status(HttpCode.Ok).send({
    data: {}
  });
}
