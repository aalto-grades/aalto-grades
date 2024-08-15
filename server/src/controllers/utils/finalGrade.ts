// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData, HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import {validateUserAndGrader} from './taskGrade';
import Course from '../../database/models/course';
import FinalGrade from '../../database/models/finalGrade';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a final grade by its ID.
 *
 * @throws ApiError(404) if not found.
 */
export const findFinalGradeById = async (id: number): Promise<FinalGrade> => {
  const finalGrade = await FinalGrade.findByPk(id);
  if (finalGrade === null) {
    throw new ApiError(
      `Final grade with ID ${id} not found`,
      HttpCode.NotFound
    );
  }
  return finalGrade;
};

/** Converts finalGrade database object into the FinalGradeData type */
export const parseFinalGrade = (finalGrade: FinalGrade): FinalGradeData => {
  const [user, grader] = validateUserAndGrader(finalGrade);
  return {
    finalGradeId: finalGrade.id,
    user: user,
    courseId: finalGrade.courseId,
    gradingModelId: finalGrade.gradingModelId,
    grader: grader,
    grade: finalGrade.grade,
    date: new Date(finalGrade.date),
    sisuExportDate: finalGrade.sisuExportDate,
    comment: finalGrade.comment,
  };
};

/**
 * Finds a final grade by id and also validates that it belongs to the correct
 * course.
 *
 * @throws ApiError(400|404|409) if invalid ids, not found, or didn't match.
 */
export const findAndValidateFinalGradePath = async (
  courseId: string,
  finalGradeId: string
): Promise<[Course, FinalGrade]> => {
  const result = stringToIdSchema.safeParse(finalGradeId);
  if (!result.success) {
    throw new ApiError(
      `Invalid final grade ID ${finalGradeId}`,
      HttpCode.BadRequest
    );
  }
  const course = await findAndValidateCourseId(courseId);
  const finalGrade = await findFinalGradeById(result.data);

  // Check that final grade belongs to the course.
  if (finalGrade.courseId !== course.id) {
    throw new ApiError(
      `Final grade ID ${finalGradeId} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  return [course, finalGrade];
};
