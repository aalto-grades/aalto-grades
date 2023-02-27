// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceCreationRoute from '../context/InstanceCreationRoute';
import AddAssignmentsView from '../components/AddAssignmentsView';
import mockAssignmentsClient from '../mock-data/mockAssignmentsClient';

describe('Tests for AddAssignmentsView components', () => {

  const renderAddAssignmentsView = async () => {
    return render(
      <MemoryRouter initialEntries={['/A-12345/add-assignments/test']}>
        <Routes>
          <Route element={<InstanceCreationRoute/>}>
            <Route path=':courseId/add-assignments/:instanceId' element={<AddAssignmentsView/>}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  test('AddAssignmentsView should render the AddAssignmentsView and contain appropriate components', async () => {

    renderAddAssignmentsView();

    await waitFor(() => {
      const assignment1 = screen.getByText(mockAssignmentsClient[0].name);
      const assignment2 = screen.getByText(mockAssignmentsClient[0].name);
      const assignment3 = screen.getByText(mockAssignmentsClient[0].name);
      const createButton = screen.getByText('Create assignment');
      const confirmButton = screen.getByText('Confirm assignments');
      const goBackButton = screen.getByText('Go back');

      expect(assignment1).toBeInTheDocument();
      expect(assignment2).toBeInTheDocument();
      expect(assignment3).toBeInTheDocument();
      expect(createButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
      expect(goBackButton).toBeInTheDocument();

      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBe(mockAssignmentsClient.length);
      const editButtons = screen.queryByText('Edit');
      expect(editButtons).toBe(null);
    });

  });

  test('AddAssignmentsView should allow adding a suggested assignment to the added assignments and delete it from suggested', async () => {

    renderAddAssignmentsView();

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBe(mockAssignmentsClient.length);
      userEvent.click(addButtons[0]);

      const newAddButtons = screen.getAllByText('Add');
      expect(newAddButtons.length).toBe(mockAssignmentsClient.length - 1);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBe(1);
    });

  });

});