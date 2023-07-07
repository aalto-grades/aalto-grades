// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import formulasService from '../services/formulas';
import FormulaAttributesView from '../components/FormulaAttributesView';
import mockAttainments from './mock-data/mockAttainments';
import mockFormulas from './mock-data/mockFormulas';

describe('Tests for FormulaAttributesView components', () => {

  const mockData = {
    selectedAttainments: mockAttainments,
    selectedFormula: mockFormulas[0]
  };

  async function renderFormulaAttributesView() {
    jest.spyOn(formulasService, 'getFormulaDetails').mockResolvedValue(mockFormulas[0]);

    return render(
      <MemoryRouter initialEntries={['/A-12345/formula-attributes/test']}>
        <Routes>
          <Route element={<Outlet context={mockData} />}>
            <Route
              path=':courseId/formula-attributes/:instanceId'
              element={<FormulaAttributesView />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test('FormulaAttributesView should contain all of the appropriate components', async () => {

    renderFormulaAttributesView();

    await waitFor(() => {
      expect(screen.getByText('Specify Formula Attributes')).toBeInTheDocument();
      expect(screen.getByText('Result: Course Total Grade')).toBeInTheDocument();
      expect(screen.getByText('Go back')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

  });

  test('Formula attributes view should render a message if "Confirm" is clicked', async () => {

    renderFormulaAttributesView();

    await waitFor(async () => {
      expect(screen.queryByText(
        'Formula attributes saved, you will be redirected to the course page.'
      )).not.toBeInTheDocument();

      userEvent.click(screen.getByText('Confirm'));

      expect(await screen
        .findByText(
          'Formula attributes saved, you will be redirected to the course page.'
        ))
        .toBeInTheDocument();
    });

  });

});
