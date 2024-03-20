// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';

import Attainment from '../../database/models/attainment';
import AttainmentGrade from '../../database/models/attainmentGrade';

import {AttainmentData} from '@common/types';
import {ApiError} from '../../types';

/**
 * Finds an attainment by its ID.
 * @param {number} id - The ID of the attainment.
 * @param {HttpCode} errorCode - HTTP status code to return if the attainment was not found.
 * @returns {Promise<Attainment>} - The found attainment model object.
 * @throws {ApiError} - If the attainment is not found, it throws an error
 * with a message indicating the missing attainment with the specific ID.
 */
export async function findAttainmentById(
  id: number,
  errorCode: HttpCode
): Promise<Attainment> {
  const attainment: Attainment | null = await Attainment.findByPk(id);
  if (!attainment) {
    throw new ApiError(`attainment with ID ${id} not found`, errorCode);
  }
  return attainment;
}

/**
 * Finds an attainment grade by its ID.
 * @param {number} id - The ID of the attainment grade.
 * @param {HttpCode} errorCode - HTTP status code to return if the attainment grade was not found.
 * @returns {Promise<Attainment>} - The found attainment grade model object.
 * @throws {ApiError} - If the attainment grade is not found, it throws an error
 * with a message indicating the missing attainment grade with the specific ID.
 */
export async function findAttainmentGradeById(
  id: number,
  errorCode: HttpCode
): Promise<AttainmentGrade> {
  const attainment: AttainmentGrade | null = await AttainmentGrade.findByPk(id);
  if (!attainment) {
    throw new ApiError(`attainment grade with ID ${id} not found`, errorCode);
  }
  return attainment;
}

/**
 * Finds all attainments of a specific assessment model.
 * @param {number} courseId - The ID of the assessment model.
 * @returns {Promise<Array<AttainmentData>>} - The resulting array of AttainmentData.
 * @throws {ApiError} - If no attainments were found, it throws an error
 * with a message indicating that attainments were not found for the assessment
 * model.
 */
export async function findAttainmentsByCourseId(courseId: number) {
  const attainments: Array<Attainment> = await Attainment.findAll({
    where: {
      courseId: courseId,
    },
    order: [['id', 'ASC']],
  });

  const attainmentData = attainments.map((attainment: Attainment) => {
    return {
      id: attainment.id,
      courseId: attainment.courseId,
      name: attainment.name,
      daysValid: attainment.daysValid,
    };
  });

  return attainmentData;
}

/**
 * Recursive function for creating a tree of descendant attainments.
 * @param {AttainmentData} attainment - The root attainment, based on which the tree is built.
 * @param {Array<AttainmentData>} allAttainments - Array of attainments, containing the children.
 * @param {boolean} [onlyChildren] - Flag for only including the immediate child attainments.
 * @returns {void} - Void, as the object passed in attainment parameter is modified.
 */
export function generateAttainmentTree(
  attainment: AttainmentData,
  allAttainments: Array<AttainmentData>,
  onlyChildren?: boolean
): void {
  const children: Array<AttainmentData> = allAttainments.filter(
    (el: AttainmentData) => el.parentId === attainment.id
  );
  if (children.length > 0) {
    attainment.subAttainments = children;
    if (!onlyChildren) {
      attainment.subAttainments.forEach((el: AttainmentData) => {
        generateAttainmentTree(el, allAttainments);
      });
    }
  }
}

// export async function validateAttainmentPath(
//   courseId: unknown,
//   attainmentId: unknown
// ): Promise<[Course, Attainment]> {

//   const attainmentIdValidated: number = (
//     await idSchema.validate({id: attainmentId}, {abortEarly: false})
//   ).id;

//   // Ensure that attainment exists.
//   const attainment: Attainment = await findAttainmentById(
//     attainmentIdValidated,
//     HttpCode.NotFound
//   );

//   // Check that attainment belongs to the assessment model.
//   if (attainment.courseId !== course.id) {
//     throw new ApiError(
//       `attainment with ID ${attainmentId} ` +
//         `does not belong to the course with ID ${courseId}`,
//       HttpCode.Conflict
//     );
//   }

//   return [course, attainment];
// }
