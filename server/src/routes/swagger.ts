// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/**
 * This file is used as a base for the swagger complition in the index.js file of routes.
 */

export const definition: object = {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'APIs Document',
    description: 'Documentation of Aalto Grades Backend API',
    termsOfService: '',
    license: {
      name: 'MIT',
      url: 'https://github.com/aalto-grades/base-repository/blob/main/LICENSE'
    }
  },
  tags:[
    {
      name: 'SISU'
    },
    {
      name: 'Course'
    },
    {
      name: 'Session'
    }
  ]
};