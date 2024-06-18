// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  RenderResult,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import NotFound from '../components/NotFound';

afterEach(cleanup);

describe('Tests for NotFound component', () => {
  const renderFetchInstancesView = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/course-view/4/notfound']}>
          <Routes>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test('Not found page should display message when route does not exist', async () => {
    renderFetchInstancesView();
    await waitFor(() => {
      expect(screen.getByText('404 - Not found')).toBeInTheDocument();
      expect(
        screen.getByText('The page you’re looking for doesn’t exist.')
      ).toBeInTheDocument();
      expect(screen.getByText('Go back to main page')).toBeInTheDocument();
    });
  });
});
