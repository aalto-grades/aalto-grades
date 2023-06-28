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
        const headingElement = screen.queryByText('Select Grading Formula');
        const subHeadingElement = screen.queryByText('Result: Course Total Grade');
        const attainmentSelection = screen.queryByText(
          'Select the sub study attainments you want to include in the calculation'
        );
        const projectsCheckbox = screen.queryByText('Projects');
        const examCheckbox = screen.queryByText('Exams');
        const formulaSelector = screen.queryByText('Formula');
        const formulaPreview = screen.queryByText('Preview of the formula');
        const submitInstructions = screen.queryByText(
          'Specify attribute values for the sub study attainments'
        );
        const specifyAttributesButton = screen.queryByText('Specify attributes');
        const skipAttributesButton = screen.queryByText('Skip for now');

        expect(headingElement).toBeInTheDocument();
        expect(subHeadingElement).toBeInTheDocument();
        expect(attainmentSelection).toBeInTheDocument();
        expect(projectsCheckbox).toBeInTheDocument();
        expect(examCheckbox).toBeInTheDocument();
        expect(formulaSelector).toBeInTheDocument();
        expect(formulaPreview).toBeInTheDocument();
        expect(submitInstructions).toBeInTheDocument();
        expect(specifyAttributesButton).toBeInTheDocument();
        expect(skipAttributesButton).toBeInTheDocument();
      });

    }
  );

  test(
    'SelectFormulaView should render an alert if "Specify attributes" is'
    + ' clicked without selecting any attainments or a formula',
    async () => {

      renderSelectFormulaView();

      await waitFor(async () => {
        const specifyAttributesButton = screen.queryByText('Specify attributes');

        expect(await screen.queryByText('You must select a formula'))
          .not.toBeInTheDocument();
        expect(await screen.queryByText('You must select at least one study attainment'))
          .not.toBeInTheDocument();

        userEvent.click(specifyAttributesButton);

        expect(await screen.findByText('You must select a formula')).toBeInTheDocument();
      });

    }
  );

});
