// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAssignmentView from '../components/EditAssignmentView';
import assignmentServices from '../services/assignments';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

const mockAssignmentId = 1;

describe('Tests for EditAssignmentView components', () => {

  const renderEditAssignmentView = async () => {
    return render(
      <MemoryRouter initialEntries={['/edit-attainment/A-12345/' + mockAssignmentId]}>
        <Routes>
          <Route path='/edit-attainment/:instanceId/:attainmentId' element={<EditAssignmentView/>}/>
        </Routes>
      </MemoryRouter>
    );
  };

  test('EditAssignmentView should render the appropriate amount of components', async () => {

    renderEditAssignmentView();

    await waitFor(async () => {
      const headingElement = screen.getByText('Edit Study Attainment');
      const categoryField = await screen.findAllByLabelText('Name');
      const confirmButton = screen.getByText('Confirm');

      let mockAssignment = [mockAttainmentsClient.find((attainment) => attainment.id === mockAssignmentId)];
      const numOfAttainments = assignmentServices.getNumOfAttainments(mockAssignment);

      expect(headingElement).toBeInTheDocument();
      expect(categoryField).toHaveLength(numOfAttainments);
      expect(confirmButton).toBeInTheDocument();
    });
  });

  test('EditAssignmentView should return the same data it gets if it is not changed', async () => {

    const logSpy = jest.spyOn(global.console, 'log');

    let mockAssignment = [mockAttainmentsClient.find((attainment) => attainment.id === mockAssignmentId)];
    mockAssignment = assignmentServices.formatDates(mockAssignment);

    renderEditAssignmentView();

    await waitFor(async () => {

      const confirmButton = screen.getByText('Confirm');
      userEvent.click(confirmButton);

      // Eventually test the function that adds an attainment to backend
      expect(logSpy).toHaveBeenCalledTimes(1); 
      expect(logSpy).toHaveBeenCalledWith(mockAssignment);

      logSpy.mockRestore();
    });

  });

});
