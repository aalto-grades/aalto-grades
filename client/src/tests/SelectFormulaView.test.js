// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import SelectFormulaView from '../components/SelectFormulaView';
import instancesService from '../services/instances';
import formulasService from '../services/formulas';
import dummyAssignments from '../dummy-data/dummyAssignments';
import dummyFormulas from '../dummy-data/dummyFormulas';

jest.mock('../services/instances');
jest.mock('../services/formulas');
afterEach(cleanup);

describe('Tests for SelectFormulaView components', () => {

  const renderSelectFormulaView = async () => {

    instancesService.getAssignments.mockRejectedValue('Network error');
    instancesService.getAssignments.mockResolvedValue(dummyAssignments);
    formulasService.getFormulas.mockRejectedValue('Network error');
    formulasService.getFormulas.mockResolvedValue(dummyFormulas);
    return render(
      <BrowserRouter>
        <SelectFormulaView />
      </BrowserRouter>
    );
  };

  test('SelectFormulaView should contain all of the appropriate components when calculating total grade', async () => {
    
    renderSelectFormulaView();

    await waitFor(() => {
      const headingElement = screen.queryByText('Select Grading Formula');
      const subHeadingElement = screen.queryByText('Result: Course Total Grade');
      const assignmentSelection = screen.queryByText('Select the sub-assignments you want to include in the calculation');
      const projectsCheckbox = screen.queryByText('Projects');
      const examCheckbox = screen.queryByText('Exam');
      const formulaSelector = screen.queryByText('Formula');
      const formulaPreview = screen.queryByText('Preview of the formula');
      const submitInstructions = screen.queryByText('Specify the attribute values for the sub-assignments now or leave it for later');
      const specifyAttributesButton = screen.queryByText('Specify attributes');
      const skipAttributesButton = screen.queryByText('Skip for now');

      expect(headingElement).toBeInTheDocument();
      expect(subHeadingElement).toBeInTheDocument();
      expect(assignmentSelection).toBeInTheDocument();
      expect(projectsCheckbox).toBeInTheDocument();
      expect(examCheckbox).toBeInTheDocument();
      expect(formulaSelector).toBeInTheDocument();
      expect(formulaPreview).toBeInTheDocument();
      expect(submitInstructions).toBeInTheDocument();
      expect(specifyAttributesButton).toBeInTheDocument();
      expect(skipAttributesButton).toBeInTheDocument();
    });
  
  });
});