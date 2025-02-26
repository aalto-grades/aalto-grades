// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Op} from 'sequelize';

import {type FinalGradeData, HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import {validateUserAndGrader} from './taskGrade';
import type Course from '../../database/models/course';
import FinalGrade from '../../database/models/finalGrade';
import User from '../../database/models/user';
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

/** Converts finalGrade database object into the FinalGradeData type */
export const parseFinalGrade = (finalGrade: FinalGrade): FinalGradeData => {
  const [user, grader] = validateUserAndGrader(finalGrade);
  return {
    id: finalGrade.id,
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
 * Validates that all student numbers in the array exist
 *
 * @throws ApiError(404) If a student number is not found in the database
 */
export const studentNumbersExist = async (
  studentNumbers: string[]
): Promise<void> => {
  const dbStudentNumbers = (
    await User.findAll({
      attributes: ['studentNumber'],
      where: {
        studentNumber: {[Op.in]: studentNumbers},
      },
    })
  ).map(student => student.studentNumber);

  if (dbStudentNumbers.length !== studentNumbers.length) {
    const errors: string[] = [];

    for (const studentNumber of studentNumbers) {
      if (!dbStudentNumbers.includes(studentNumber)) {
        errors.push(`user with student number ${studentNumber} not found`);
      }
    }

    throw new ApiError(errors, HttpCode.NotFound);
  }
};

/**
 * Find all final grades for given course and student numbers
 *
 * @throws ApiError(404)
 */
export const getFinalGradesFor = async (
  courseId: number,
  studentNumbers: string[]
): Promise<FinalGradeData[]> => {
  const dbFinalGrades = await FinalGrade.findAll({
    where: {courseId: courseId},
    include: [
      {
        model: User,
        required: true,
        as: 'grader',
        attributes: ['id', 'name'],
      },
      {
        model: User,
        attributes: ['id', 'studentNumber'],
        where: {
          studentNumber: {
            [Op.in]: studentNumbers,
          },
        },
      },
    ],
    order: [['id', 'ASC']],
  });

  if (dbFinalGrades.length === 0) {
    throw new ApiError(
      'no grades found, make sure grades have been ' +
        'uploaded/calculated before requesting course results',
      HttpCode.NotFound
    );
  }

  return dbFinalGrades.map(parseFinalGrade);
};

/** If we should prefer the new final grade in the Sisu CSV */
export const sisuPreferFinalGrade = (
  newGrade: FinalGradeData,
  oldGrade: FinalGradeData
): boolean => {
  // Prefer manual final grades
  const newIsManual = newGrade.gradingModelId === null;
  const oldIsManual = oldGrade.gradingModelId === null;
  if (newIsManual && !oldIsManual) return true;
  if (oldIsManual && !newIsManual) return false;

  if (newGrade.grade > oldGrade.grade) return true;
  return (
    newGrade.grade === oldGrade.grade &&
    new Date(newGrade.date) >= new Date(oldGrade.date)
  );
};
