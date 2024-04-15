// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  RenderResult,
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {wait} from '@testing-library/user-event/dist/utils';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import CourseResultsView from '../components/CourseResultsView';

describe('Tests for CourseResultsView components', () => {
  const renderCourseResultsView = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/1/course-results/1']}>
          <Routes>
            <Route
              path=":courseId/course-results/:assessmentModelId"
              element={<CourseResultsView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test('CourseResultsTable header is rendered', async () => {
    renderCourseResultsView();

    await waitFor(() => {
      expect(screen.getByText('Student Number')).toBeVisible();
      expect(screen.getByText('Final Grade')).toBeVisible();
      expect(screen.getByText('Exported to Sisu')).toBeVisible();
      expect(screen.getByText('Attainments')).toBeVisible();
      expect(screen.getByText('Exercise 1')).toBeVisible();
      expect(screen.getByText('Exercise 2')).toBeVisible();
      expect(screen.getByText('Exam')).toBeVisible();
    });
  });

  test('CourseResultsTable should show a dialog when clicking calculate final grades', async () => {
    renderCourseResultsView();
    await act(async () => await wait(200));

    const checkBox = screen.getByRole('checkbox');
    act(() => userEvent.click(checkBox));
    expect(checkBox).toBeChecked();

    const uploadOption = screen.getByText('Calculate final grades');
    expect(uploadOption).toBeVisible();
    act(() => userEvent.click(uploadOption));

    const statusText = screen.getByText(
      'Calculating final grades for 2 students'
    );
    expect(statusText).toBeVisible();
    expect(
      screen.getByText('Override grading date for all students')
    ).toBeVisible();
    expect(screen.getByText('Confirm')).toBeVisible();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    act(() => userEvent.click(cancelButton));

    expect(statusText).not.toBeVisible();
  });

  test('CourseResultsTable should show a dialog when clicking Download Sisu CSV', async () => {
    renderCourseResultsView();
    await act(async () => await wait(200));

    const checkBox = screen.getByRole('checkbox');
    act(() => userEvent.click(checkBox));
    expect(checkBox).toBeChecked();

    const uploadOption = screen.getByText('Download Sisu CSV');
    expect(uploadOption).toBeVisible();
    act(() => userEvent.click(uploadOption));

    const title = screen.getByText('Download final grades as Sisu CSV');
    expect(title).toBeVisible();
    expect(
      screen.getByText('Override grading date for all students')
    ).toBeVisible();
    expect(screen.getByText('Download')).toBeVisible();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    act(() => userEvent.click(cancelButton));

    expect(title).not.toBeVisible();
  });
});
