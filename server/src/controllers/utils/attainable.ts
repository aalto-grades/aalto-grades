// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainable from '../../database/models/attainable';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds an attainable by its ID.
 * @param {number} id - The ID of the attainable.
 * @param {HttpCode} errorCode - HTTP status code to return if the attainable was not found.
 * @returns {Promise<Attainable>} - The found attainable model object.
 * @throws {ApiError} - If the attainable is not found, it throws an error
 * with a message indicating the missing attainable with the specific ID.
 */
export async function findAttainableById(id: number, errorCode: HttpCode): Promise<Attainable> {
  const attainable: Attainable | null = await Attainable.findByPk(id);
  if (!attainable) {
    throw new ApiError(`study attainment with ID ${id} not found`, errorCode);
  }
  return attainable;
}
