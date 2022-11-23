// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react';
import Main from '../components/Main';


test('renders learn react link', () => {
  render(<Main />);
  const textElement = screen.getByText('This is the base for frontend development');
  expect(textElement).toBeDefined();
});
