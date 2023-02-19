// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import EditInstanceView from '../components/EditInstanceView';
import instancesService from '../services/instances';
import mockSisuInstances from '../mock-data/mockSisuInstances';

jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for EditInstanceView components', () => {

  const renderEditInstanceView = async () => {

    const mockResponse = { courseInstance: mockSisuInstances[0] };

    instancesService.getSisuInstance.mockRejectedValue('Network error');
    instancesService.getSisuInstance.mockResolvedValue(mockResponse);

    return render(
      <BrowserRouter>
        <EditInstanceView />
      </BrowserRouter>
    );
  };

  test('EditInstanceView should render the EditInstanceForm and contain all of the appropriate components', async () => {

    renderEditInstanceView();

    await waitFor(() => {
      const typeField = screen.getByLabelText('Type');
      const startingField = screen.getByLabelText('Starting Date');
      const endingField = screen.getByLabelText('Ending Date');
      const teacherField = screen.getByLabelText('Teacher of This Instance');
      const minCreditsField = screen.getByLabelText('Min Credits');
      const maxCreditsField = screen.getByLabelText('Max Credits');
      const gradingField = screen.getByLabelText('Grading Scale');
      const confirmButton = screen.queryByText('Confirm Details');

      expect(typeField).toBeInTheDocument();
      expect(startingField).toBeInTheDocument();
      expect(endingField).toBeInTheDocument();
      expect(teacherField).toBeInTheDocument();
      expect(minCreditsField).toBeInTheDocument();
      expect(maxCreditsField).toBeInTheDocument();
      expect(gradingField).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
    });

  });

});
