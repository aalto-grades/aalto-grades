// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainment from '../../database/models/attainment';

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
