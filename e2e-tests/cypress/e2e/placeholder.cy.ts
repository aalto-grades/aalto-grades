// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// An example of a test

describe('Example test suite', () => {

  it('should redirect to the login page, if the user is not logged in', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

});