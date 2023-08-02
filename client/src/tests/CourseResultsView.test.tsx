// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CourseResultsView from '../components/CourseResultsView';

describe('Tests for CourseResultsView components', () => {

  function renderCourseResultsView(): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/1/course-results/1']}>
          <Routes>
            <Route
              path=':courseId/course-results/:assessmentModelId' element={<CourseResultsView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test('CourseResultsTable should render the correct number of rows', async () => {

    renderCourseResultsView();

    await waitFor(() => {
      expect(screen.getByText('Course Results')).toBeInTheDocument();
      expect(screen.getByText('Student Number')).toBeInTheDocument();
      expect(screen.getByText('Final Grade')).toBeInTheDocument();
      expect(screen.getByText('Calculate final grades')).toBeInTheDocument();
    });

  });

  test(
    'CourseResultsTable should show a dialog for uploading a file after'
    + ' clicking the upload button',
    async () => {

      renderCourseResultsView();

      const uploadOption: HTMLElement = screen.getByText('Upload Grades CSV');
      expect(uploadOption).toBeDefined();
      act(() => userEvent.click(uploadOption));

      const dialogTitle: HTMLElement = screen.getByText('Add Grades from File');
      const uploadFileButton: HTMLElement = screen.getByText('Upload file');
      const cancelButton: HTMLElement = screen.getByText('Cancel');
      const submitButton: HTMLElement = screen.getByText('Submit');

      expect(dialogTitle).toBeVisible();
      expect(uploadFileButton).toBeVisible();
      expect(cancelButton).toBeVisible();
      expect(submitButton).toBeVisible();

      act(() => userEvent.click(cancelButton));
      expect(dialogTitle).not.toBeVisible();
    }
  );

  test(
    'CourseResultsTable should show a dialog for downloading a Sisu CSV'
    + ' after clicking the download button',
    async () => {

      renderCourseResultsView();

      await waitFor( async () => {
        const selectAllCheckBox: HTMLInputElement = screen.getByLabelText('Select all');
        act(() => userEvent.click(selectAllCheckBox));
        expect(selectAllCheckBox).toBeChecked();

        const downloadSisuCsvButton: HTMLElement = await screen.findByText('Download Sisu CSV');
        expect(downloadSisuCsvButton).toBeDefined();
        act(() => userEvent.click(downloadSisuCsvButton));

        const dialogTitle: HTMLElement = screen.getByText('Download final grades as Sisu CSV');
        const exportButton: HTMLElement = screen.getByText('Download');
        const cancelButton: HTMLElement = screen.getByText('Cancel');

        expect(dialogTitle).toBeVisible();
        expect(exportButton).toBeVisible();
        expect(cancelButton).toBeVisible();

        act(() => userEvent.click(cancelButton));
        expect(dialogTitle).not.toBeVisible();
      });

    }
  );

  test('CourseResultsTable should not render any rows before grades are imported', async () => {

    renderCourseResultsView();

    const studentRows: Array<HTMLElement> = await screen.findAllByRole('row');
    expect(studentRows.length).toEqual(1); // 25 rows are displayed by default + 1 for header row

  });

  test('CourseResultsView should display an alert when grade calculation is started', async () => {

    renderCourseResultsView();

    await waitFor( async () => {
      const selectAllCheckBox: HTMLInputElement = screen.getByLabelText('Select all');
      act(() => userEvent.click(selectAllCheckBox));
      expect(selectAllCheckBox).toBeChecked();

      expect(screen.getByText('12345A')).toBeInTheDocument();
      expect(screen.getByText('98745A')).toBeInTheDocument();
      expect(screen.getByText('12859A')).toBeInTheDocument();
      expect(screen.queryByText('Calculating final grades...')).not.toBeInTheDocument();

      const calculateGradesButton: HTMLElement = screen.getByText('Calculate final grades');
      act(() => userEvent.click(calculateGradesButton));

      expect(await screen.findByText('Calculating final grades...')).toBeInTheDocument();
    });

  });

});
