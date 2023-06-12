// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainment from '../../database/models/attainment';

import { AttainmentData } from '../../types/attainment';
import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds an attainment by its ID.
 * @param {number} id - The ID of the attainment.
 * @param {HttpCode} errorCode - HTTP status code to return if the attainment was not found.
 * @returns {Promise<Attainment>} - The found attainment model object.
 * @throws {ApiError} - If the attainment is not found, it throws an error
 * with a message indicating the missing attainment with the specific ID.
 */
export async function findAttainmentById(id: number, errorCode: HttpCode): Promise<Attainment> {
  const attainment: Attainment | null = await Attainment.findByPk(id);
  if (!attainment) {
    throw new ApiError(`study attainment with ID ${id} not found`, errorCode);
  }
  return attainment;
}

/**
 * Finds all attainments for a specific course instance.
 * @param {number} courseId - The ID of the course.
 * @param {number} instanceId - The ID of the course instance.
 * @returns {Promise<Array<AttainmentData>>} - The resulting array of AttainmentData.
 * @throws {ApiError} - If no attainments were found, it throws an error
 * with a message indicating that the attainments were not found for the course instance.
 */
export async function findAllAttainmentsForInstance(
  courseId: number,
  instanceId: number
): Promise<Array<AttainmentData>> {
  const attainments: Array<Attainment> = await Attainment.findAll({
    where: {
      courseId: courseId,
      courseInstanceId: instanceId
    }
  });

  if (attainments.length === 0) {
    throw new ApiError('Attainments were not found ' +
      'for the specified course and instance', HttpCode.NotFound);
  }

  const attainmentData: Array<AttainmentData> = attainments.map((el: Attainment) => {
    return {
      id: el.id,
      courseId: el.courseId,
      courseInstanceId: el.courseInstanceId,
      parentId: el.attainmentId ?? undefined,
      tag: generateAttainmentTag(el.id, el.courseId, el.courseInstanceId),
      name: el.name,
      date: el.date,
      expiryDate: el.expiryDate
    };
  });

  return attainmentData;
}

/**
 * Create a tag for attainment based on its id's.
 * @param {number} attainmentId - The ID of the attainment.
 * @param {number} courseId - The ID of the course the attainment belongs to.
 * @param {number} courseInstanceId - The ID of the course instance the attainment belongs to.
 * @returns {string} - Generated tag.
 */
export function generateAttainmentTag(
  attainmentId: number,
  courseId: number,
  courseInstanceId: number
): string {
  return `C${courseId}I${courseInstanceId}A${attainmentId}`;
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
    (el: AttainmentData) => el.parentId === attainment.id);
  if (children.length > 0) {
    attainment.subAttainments = children;
    if (!onlyChildren) {
      attainment.subAttainments.forEach((el: AttainmentData) => {
        generateAttainmentTree(el, allAttainments);
      });
    }
  }
}
