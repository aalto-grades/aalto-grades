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
import mockAttainmentsClient from './mock-data/mockAttainmentsClient';
import attainmentServices from '../services/attainments';

jest.mock('../services/instances');
jest.mock('../services/formulas');
afterEach(cleanup);

describe('Tests for SelectFormulaView components', () => {

  async function renderSelectFormulaView() {
    (formulasService.getFormulas as jest.Mock).mockRejectedValue('Network error');
    (formulasService.getFormulas as jest.Mock).mockRejectedValue(mockFormulas);
    jest.spyOn(formulasService, 'getFormulaDetails').mockResolvedValue(mockFormulas[0]);
    jest.spyOn(attainmentServices, 'getAllAttainments').mockResolvedValue(mockAttainmentsClient);

    return render(
      <MemoryRouter initialEntries={['/1/select-formula/1']}>
        <Routes>
          <Route element={<FormulaSelectionRoute/>}>
            <Route
              path=':courseId/select-formula/:assessmentModelId'
              element={<SelectFormulaView />}
            />
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
        const headingElement: HTMLElement = screen.queryByText('Select Grading Formula');
        const subHeadingElement: HTMLElement = screen.queryByText('Result: Course Total Grade');
        const attainmentSelection: HTMLElement = screen.queryByText(
          'Select the sub study attainments you want to include in the calculation'
        );
        const projectsCheckbox: HTMLElement = screen.queryByText('Project');
        const examCheckbox: HTMLElement = screen.queryByText('Exam');
        const exercisesheckbox: HTMLElement = screen.queryByText('Exercises');
        const formulaSelector: HTMLElement = screen.queryByText('Formula');
        const formulaPreview: HTMLElement = screen.queryByText('Preview of the formula');
        const submitInstructions: HTMLElement = screen.queryByText(
          'Specify attribute values for the sub study attainments'
        );
        const specifyAttributesButton: HTMLElement = screen.queryByText('Specify attributes');
        const skipAttributesButton: HTMLElement = screen.queryByText('Skip for now');

        expect(headingElement).toBeInTheDocument();
        expect(subHeadingElement).toBeInTheDocument();
        expect(attainmentSelection).toBeInTheDocument();
        expect(projectsCheckbox).toBeInTheDocument();
        expect(examCheckbox).toBeInTheDocument();
        expect(exercisesheckbox).toBeInTheDocument();
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
        const specifyAttributesButton: HTMLElement = screen.queryByText('Specify attributes');

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
