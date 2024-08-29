// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';

import {
  type EditGradingModelData,
  type GradingModelData,
  HttpCode,
  type NewGradingModelData,
} from '@/common/types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {findCoursePartByCourseId} from './utils/coursePart';
import {findCourseTaskByCourseId} from './utils/courseTask';
import {
  checkGradingModelSources,
  validateGradingModelPath,
} from './utils/gradingModel';
import GradingModel from '../database/models/gradingModel';
import {ApiError, type Endpoint} from '../types';

// TODO: Add support for course part models

/**
 * () => GradingModelData
 *
 * @throws ApiError(400|404|409)
 */
export const getGradingModel: Endpoint<void, GradingModelData> = async (
  req,
  res
) => {
  const [course, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );
  const coursePartData = await findCoursePartByCourseId(course.id);
  const courseTaskData = await findCourseTaskByCourseId(course.id);

  res.json({
    id: gradingModel.id,
    courseId: gradingModel.courseId,
    coursePartId: gradingModel.coursePartId,
    name: gradingModel.name,
    graphStructure: gradingModel.graphStructure,
    archived: gradingModel.archived,
    ...checkGradingModelSources(
      gradingModel,
      gradingModel.coursePartId !== null
        ? courseTaskData.filter(
            task => task.coursePartId === gradingModel.coursePartId
          )
        : coursePartData
    ),
  });
};

/**
 * () => GradingModelData[]
 *
 * @throws ApiError(400|404)
 */
export const getAllGradingModels: Endpoint<void, GradingModelData[]> = async (
  req,
  res
) => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const coursePartData = await findCoursePartByCourseId(course.id);
  const courseTaskData = await findCourseTaskByCourseId(course.id);

  const gradingModels = await GradingModel.findAll({
    where: {courseId: course.id},
  });

  const gradingModelsData = [];
  for (const gradingModel of gradingModels) {
    gradingModelsData.push({
      id: gradingModel.id,
      courseId: gradingModel.courseId,
      coursePartId: gradingModel.coursePartId,
      name: gradingModel.name,
      graphStructure: gradingModel.graphStructure,
      archived: gradingModel.archived,
      ...checkGradingModelSources(
        gradingModel,
        gradingModel.coursePartId !== null
          ? courseTaskData.filter(
              task => task.coursePartId === gradingModel.coursePartId
            )
          : coursePartData
      ),
    });
  }

  res.json(gradingModelsData);
};

/**
 * (NewGradingModelData) => number
 *
 * @throws ApiError(400|404|409)
 */
export const addGradingModel: Endpoint<NewGradingModelData, number> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);

  let modelId;
  try {
    const [gradingModel, created] = await GradingModel.findOrCreate({
      where: {
        name: req.body.name,
        courseId: courseId,
      },
      defaults: {
        name: req.body.name,
        courseId: courseId,
        coursePartId: req.body.coursePartId,
        graphStructure: req.body.graphStructure,
      },
    });

    if (!created) {
      throw new ApiError(
        `Grading model with name '${req.body.name}' already exists in course ID ${courseId}`,
        HttpCode.Conflict
      );
    }
    modelId = gradingModel.id;
  } catch (error) {
    // Duplicate course part id error
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two grading models for the same course part',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.status(HttpCode.Created).json(modelId);
};

/**
 * (EditGradingModelData) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editGradingModel: Endpoint<EditGradingModelData, void> = async (
  req,
  res
) => {
  const [, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );

  // Update grading model & catch duplicate name error.
  try {
    await gradingModel.update({
      name: req.body.name ?? gradingModel.name,
      graphStructure: req.body.graphStructure ?? gradingModel.graphStructure,
      archived: req.body.archived ?? gradingModel.archived,
    });
  } catch (error) {
    // Duplicate name error
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two grading models with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteGradingModel: Endpoint<void, void> = async (req, res) => {
  const [, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );

  try {
    await gradingModel.destroy();
  } catch (error) {
    // Catch deletion of grading model with final grades
    if (
      error instanceof ForeignKeyConstraintError &&
      error.index === 'final_grade_grading_model_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete grading model with final grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};
