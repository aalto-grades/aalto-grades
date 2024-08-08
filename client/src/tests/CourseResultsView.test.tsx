// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Experimental_CssVarsProvider as CssVarsProvider} from '@mui/material';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  RenderResult,
  configure,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {RouterProvider, createMemoryRouter} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import CourseResultsView from '../components/course/CourseResultsView';
import AuthContext from '../context/AuthProvider';

describe('Tests for CourseResultsView components', () => {
  const renderCourseResultsView = (): RenderResult => {
    const router = createMemoryRouter(
      [
        {
          path: ':courseId/course-results/:gradingModelId',
          element: <CourseResultsView />,
        },
      ],
      {initialEntries: ['/1/course-results/1']}
    );
    return render(
      <CssVarsProvider>
        <QueryClientProvider client={new QueryClient()}>
          <AuthContext.Provider
            value={{
              auth: {
                id: 2,
                name: 'Timmy Teacher',
                role: SystemRole.User,
              },
              setAuth: vi.fn(),
              isTeacherInCharge: true,
              setIsTeacherInCharge: vi.fn(),
              setIsAssistant: vi.fn(),
              isAssistant: false,
            }}
          >
            <RouterProvider router={router} />
          </AuthContext.Provider>
        </QueryClientProvider>
      </CssVarsProvider>
    );
  };

  beforeEach(() => {
    // Tests will fail without this
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    configure({testIdAttribute: 'id'});
  });

  test('CourseResultsTable header is rendered', async () => {
    renderCourseResultsView();

    await waitFor(() => {
      expect(screen.getByText('Student number')).toBeVisible();
      expect(screen.getByText('Final grade')).toBeVisible();
      expect(screen.getByText('Exported to Sisu')).toBeVisible();
      expect(screen.getByText('Exercise 1')).toBeVisible();
      expect(screen.getByText('Exercise 2')).toBeVisible();
      expect(screen.getByText('Exam')).toBeVisible();
    });
  });

  test('CourseResultsTable should show a dialog when clicking calculate final grades', async () => {
    renderCourseResultsView();

    await waitFor(async () => {
      const checkBox = screen.getByTestId('select-all');
      await userEvent.click(checkBox);
      expect(checkBox).toBeChecked();

      const uploadOption = screen.getByTestId('calculate-final-grades');
      expect(uploadOption).toBeVisible();
      await userEvent.click(uploadOption);

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
      await userEvent.click(cancelButton);

      expect(statusText).not.toBeVisible();
    });
  });

  test('CourseResultsTable should show a dialog when clicking Download Sisu CSV', async () => {
    renderCourseResultsView();

    await waitFor(async () => {
      const checkBox = screen.getByTestId('select-all');
      await userEvent.click(checkBox);
      expect(checkBox).toBeChecked();

      const uploadOption = screen.getByText('Download Sisu CSV');
      expect(uploadOption).toBeVisible();
      await userEvent.click(uploadOption);

      const title = screen.getByText('Download final grades as Sisu CSV');
      expect(title).toBeVisible();
      expect(
        screen.getByText('Override grading date for all students')
      ).toBeVisible();
      expect(screen.getByText('Download')).toBeVisible();

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeVisible();
      await userEvent.click(cancelButton);

      expect(title).not.toBeVisible();
    });
  });
});
