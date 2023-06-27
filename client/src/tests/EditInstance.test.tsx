// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import InstanceCreationRoute from '../context/InstanceCreationRoute';
import EditInstanceView from '../components/EditInstanceView';
import instancesService from '../services/instances';
import mockSisuInstances from './mock-data/mockSisuInstances';

jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for EditInstanceView components', () => {

  async function renderEditInstanceView() {

    const mockResponse = mockSisuInstances[0];

    (instancesService.getSisuInstance as jest.Mock).mockRejectedValue('Network error');
    (instancesService.getSisuInstance as jest.Mock).mockResolvedValue(mockResponse);

    return render(
      <MemoryRouter initialEntries={['/A-12345/edit-instance/test']}>
        <Routes>
          <Route element={<InstanceCreationRoute/>}>
            <Route path=':courseId/edit-instance/:instanceId' element={<EditInstanceView/>}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test(
    'EditInstanceView should render the EditInstanceForm and contain all of'
    + ' the appropriate components',
    async () => {

      renderEditInstanceView();

      await waitFor(() => {
        const typeField = screen.getByLabelText('Type');
        const startingField = screen.getByLabelText('Starting Date');
        const endingField = screen.getByLabelText('Ending Date');
        const teacherField = screen.getByLabelText('Teacher in Charge');
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

    }
  );

});
