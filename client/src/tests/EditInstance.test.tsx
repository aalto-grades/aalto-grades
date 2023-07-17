// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render, RenderResult, screen, waitFor } from '@testing-library/react';

import EditInstanceView from '../components/EditInstanceView';

import mockCourses from './mock-data/mockCourses';
import mockSisuInstances from './mock-data/mockSisuInstances';
import courseServices from '../services/courses';
import instanceServices from '../services/instances';

jest.mock('../services/courses');
jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for EditInstanceView components without Sisu instance', () => {

  function renderEditInstanceView(): RenderResult {

    (courseServices.getCourse as jest.Mock).mockRejectedValue('Network error');
    (courseServices.getCourse as jest.Mock).mockResolvedValue(mockCourses[0]);

    return render(
      <MemoryRouter initialEntries={['/A-12345/edit-instance']}>
        <Routes>
          <Route path=':courseId/edit-instance' element={<EditInstanceView />} />
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
        expect(screen.getByLabelText('Type*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Grading Scale*')).toBeInTheDocument();
        expect(screen.queryByText('Confirm Details')).toBeInTheDocument();
      });

    }
  );

});

describe('Tests for EditInstanceView components with Sisu instance', () => {

  function renderEditInstanceView(): RenderResult {

    (instanceServices.getSisuInstance as jest.Mock).mockRejectedValue('Network error');
    (instanceServices.getSisuInstance as jest.Mock).mockResolvedValue(mockSisuInstances[0]);

    return render(
      <MemoryRouter initialEntries={['/A-12345/edit-instance/test']}>
        <Routes>
          <Route path=':courseId/edit-instance/:sisuInstanceId' element={<EditInstanceView />} />
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
        expect(screen.getByLabelText('Type*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Grading Scale*')).toBeInTheDocument();
        expect(screen.queryByText('Confirm Details')).toBeInTheDocument();
      });

    }
  );

});
