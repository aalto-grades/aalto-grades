// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

/**
 * Asynchronously adds grades from a CSV file to the database.
 * @param {Request} req - The HTTP request containing the CSV file.
 * @param {Response} res - The HTTP response to be sent to the client.
 * @param {NextFunction} next - The next middleware function to be executed in the pipeline.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If the CSV file loading fails.
*/
export async function addGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  /*
   * TODO: Check that the requester is logged in, 401 Unauthorized if not
   * TODO: Check that the requester is authorized to add grades, 403 Forbidden if not
   * TODO: Validate csv fields, csv has to match predetermined format, 400 Bad request?
   */

  if (!req?.file) {
    throw new ApiError('csv file loading failed, please try again', HttpCode.BadRequest);
  }

  const data: string = req.file.buffer.toString();
  const csvData: Array<Array<string>> = [];

  const parser: Parser = parse({
    delimiter: ','
  });

  parser
    .on('readable', function (): void {
      let row: Array<string>;
      while ((row = parser.read()) !== null) {
        csvData.push(row);
      }
    })
    .on('error', function (err: unknown): void {
      next(err);
    })
    .on('end', function (): void {
      console.log('CSV:', csvData);

      res.status(HttpCode.Ok).json({
        success: true,
        data: {}
      });
      return;
    });

  // Write data to the stream
  parser.write(data);

  // Close the readable stream
  parser.end();
}
