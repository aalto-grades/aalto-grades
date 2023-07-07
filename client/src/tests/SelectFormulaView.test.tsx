// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectFormulaView from '../components/SelectFormulaView';
import formulasService from '../services/formulas';
import FormulaSelectionRoute from '../context/FormulaSelectionRoute';
import mockFormulas from './mock-data/mockFormulas';
// import mockAttainments from './mock-data/mockAttainments';
// import instancesService from '../services/instances';

jest.mock('../services/instances');
jest.mock('../services/formulas');
afterEach(cleanup);

describe('Tests for SelectFormulaView components', () => {

  async function renderSelectFormulaView() {
    (formulasService.getFormulas as jest.Mock).mockRejectedValue('Network error');
    (formulasService.getFormulas as jest.Mock).mockRejectedValue(mockFormulas);
    jest.spyOn(formulasService, 'getFormulaDetails').mockResolvedValue(mockFormulas[0]);

    // TODO, include once get attainments work
    //(instancesService.getAttainments as jest.Mock).mockRejectedValue('Network error');
    //(instancesService.getAttainments as jest.Mock).mockResolvedValue(mockAttainments);

    return render(
      <MemoryRouter initialEntries={['/A-12345/select-formula/test']}>
        <Routes>
          <Route element={<FormulaSelectionRoute/>}>
            <Route path=':courseId/select-formula/:instanceId' element={<SelectFormulaView />}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test(
    'SelectFormulaView should contain all of the appropriate components when'
    + ' calculating total grade',
    async () => {

      renderSelectFormulaView();

      await waitFor(() => {
        expect(screen.getByText('Select Grading Formula')).toBeInTheDocument();
        expect(screen.getByText('Result: Course Total Grade')).toBeInTheDocument();
        expect(screen.getByText(
          'Select the sub study attainments you want to include in the calculation'
        )).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Exams')).toBeInTheDocument();
        expect(screen.getByText('Formula')).toBeInTheDocument();
        expect(screen.getByText('Preview of the formula')).toBeInTheDocument();
        expect(screen.getByText(
          'Specify attribute values for the sub study attainments'
        )).toBeInTheDocument();
        expect(screen.getByText('Specify attributes')).toBeInTheDocument();
        expect(screen.getByText('Skip for now')).toBeInTheDocument();
      });

    }
  );

  test(
    'SelectFormulaView should render an alert if "Specify attributes" is'
    + ' clicked without selecting any attainments or a formula',
    async () => {

      renderSelectFormulaView();

      await waitFor(async () => {
        expect(screen.queryByText('You must select a formula'))
          .not.toBeInTheDocument();
        expect(screen.queryByText('You must select at least one study attainment'))
          .not.toBeInTheDocument();

        userEvent.click(screen.getByText('Specify attributes'));

        expect(await screen.findByText('You must select a formula')).toBeInTheDocument();
      });

    }
  );

});
