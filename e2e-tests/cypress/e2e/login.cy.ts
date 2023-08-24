// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import users from '../fixtures/users.json';

describe('Test login', () => {

  it('should redirect to the login page, if the user is not logged in', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('should succeed and redirect to front page with valid credentials', () => {
    cy.login(users.admin.email, users.admin.password);
  });

  it('should fail and display an error message with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type=email]').type('nonexistent@nothing.org');
    cy.get('input[type=password]').type('nothing');
    cy.contains('button[type=submit]', 'log in').click();
    cy.url().should('include', '/login');
    cy.contains('401 - Unauthorized, incorrect email or password');
  });

});