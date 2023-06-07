// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceCreationRoute from '../context/InstanceCreationRoute';
import AddAssignmentsView from '../components/AddAssignmentsView';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

describe('Tests for AddAssignmentsView components', () => {

  const renderAddAssignmentsView = async () => {
    return render(
      <MemoryRouter initialEntries={['/A-12345/add-attainments/test']}>
        <Routes>
          <Route element={<InstanceCreationRoute/>}>
            <Route path=':courseId/add-attainments/:instanceId' element={<AddAssignmentsView/>}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  test('AddAssignmentsView should render the AddAssignmentsView and contain appropriate components', async () => {

    renderAddAssignmentsView();

    await waitFor(() => {
      const attainment1 = screen.getByText(mockAttainmentsClient[0].name);
      const attainment2 = screen.getByText(mockAttainmentsClient[0].name);
      const attainment3 = screen.getByText(mockAttainmentsClient[0].name);
      const createButton = screen.getByText('Create attainment');
      const confirmButton = screen.getByText('Confirm attainments');
      const goBackButton = screen.getByText('Go back');

      expect(attainment1).toBeInTheDocument();
      expect(attainment2).toBeInTheDocument();
      expect(attainment3).toBeInTheDocument();
      expect(createButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
      expect(goBackButton).toBeInTheDocument();

      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBe(mockAttainmentsClient.length);
      const editButtons = screen.queryByText('Edit');
      expect(editButtons).toBe(null);
    });

  });

  test('AddAssignmentsView should allow adding a suggested attainment to the added attainments and delete it from suggested', async () => {

    renderAddAssignmentsView();

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBe(mockAttainmentsClient.length);
      act(() => userEvent.click(addButtons[0]));

      const newAddButtons = screen.getAllByText('Add');
      expect(newAddButtons.length).toBe(mockAttainmentsClient.length - 1);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBe(1);
    });

  });

});
