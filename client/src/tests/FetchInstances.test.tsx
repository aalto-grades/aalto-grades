// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {
  cleanup,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';

import FetchInstancesView from '../components/FetchInstancesView';

import {mockSisuInstances} from './mock-data/mockSisuInstances';

afterEach(cleanup);

describe('Tests for FetchInstancesView components', () => {
  const instancesLength: number = mockSisuInstances.length;

  function renderFetchInstancesView(): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/1/fetch-instances/ABCDEFG']}>
          <Routes>
            <Route
              path="/:courseId/fetch-instances/:courseCode"
              element={<FetchInstancesView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test('FetchInstancesView should contain all of the appropriate components', async () => {
    renderFetchInstancesView();

    await waitFor(() => {
      expect(screen.getByText('Instances Found from Sisu')).toBeInTheDocument();
      expect(
        screen.getByText('Select the instance you wish to add')
      ).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
      expect(screen.getAllByText('Type:')).toHaveLength(instancesLength);
      expect(screen.getAllByText('Starting Date:')).toHaveLength(
        instancesLength
      );
      expect(screen.getAllByText('Ending Date:')).toHaveLength(instancesLength);
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByText('06.02.2023')).toBeInTheDocument();
    });
  });
});
