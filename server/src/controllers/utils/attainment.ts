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
    throw new ApiError(`attainment with ID ${id} not found`, errorCode);
  }
  return attainment;
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
