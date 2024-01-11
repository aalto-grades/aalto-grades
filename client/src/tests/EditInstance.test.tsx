// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {
  cleanup,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';

import EditInstanceView from '../components/EditInstanceView';

afterEach(cleanup);

describe('Tests for EditInstanceView components without Sisu instance', () => {
  function renderEditInstanceView(): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/A-12345/edit-instance']}>
          <Routes>
            <Route
              path=":courseId/edit-instance"
              element={<EditInstanceView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test(
    'EditInstanceView should render the EditInstanceForm and contain all of' +
      ' the appropriate components',
    async () => {
      renderEditInstanceView();

      await waitFor(() => {
        expect(screen.getByLabelText('Type*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Period*')).toBeInTheDocument();
        expect(screen.queryByText('Submit')).toBeInTheDocument();
      });
    }
  );
});

describe('Tests for EditInstanceView components with Sisu instance', () => {
  function renderEditInstanceView(): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/A-12345/edit-instance/test']}>
          <Routes>
            <Route
              path=":courseId/edit-instance/:sisuInstanceId"
              element={<EditInstanceView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test(
    'EditInstanceView should render the EditInstanceForm and contain all of' +
      ' the appropriate components',
    async () => {
      renderEditInstanceView();

      await waitFor(() => {
        expect(screen.getByLabelText('Type*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Date*')).toBeInTheDocument();
        expect(screen.getByLabelText('Starting Period*')).toBeInTheDocument();
        expect(screen.getByLabelText('Ending Period*')).toBeInTheDocument();
        expect(screen.queryByText('Submit')).toBeInTheDocument();
      });
    }
  );
});
