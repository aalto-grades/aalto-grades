// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum HttpCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  BadGateway = 502
}

type Day =
  '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' |
  '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' |
  '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' |
  '31';

type Month =
  '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' |
  '11' | '12'

export type DateOnlyString =
  `${number}${number}${number}${number}-${Month}-${Day}`;
