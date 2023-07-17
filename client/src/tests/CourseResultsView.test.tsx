// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CourseResultsView from '../components/CourseResultsView';
import gradeServices from '../services/grades';
import { finalGrades } from './mock-data/mockFinalGrades';

describe('Tests for CourseResultsView components', () => {

  function renderCourseResultsView(): RenderResult {
    jest.spyOn(gradeServices, 'getFinalGrades').mockResolvedValue(finalGrades);

    return render(
      <MemoryRouter initialEntries={['/1/course-results/1']}>
        <Routes>
          <Route
            path=':courseId/course-results/:assessmentModelId' element={<CourseResultsView />} />
        </Routes>
      </MemoryRouter>
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
    'CourseResultsTable should show a dialog for uploading a file when'
    + ' clicking on a menu button and choosing that option',
    async () => {

      renderCourseResultsView();

      const importGradesMenuButton: HTMLElement = await screen.findByText('Import grades');
      expect(importGradesMenuButton).toBeDefined();
      act(() => userEvent.click(importGradesMenuButton));

      const uploadOption: HTMLElement = screen.getByText('Import from file');
      expect(uploadOption).toBeDefined();
      act(() => userEvent.click(uploadOption));

      const dialogTitle: HTMLElement = screen.getByText('Add Grades from File');
      const uploadFileButton: HTMLElement = screen.getByText('Upload file');
      const cancelButton: HTMLElement = screen.getByText('Cancel');
      const confirmButton: HTMLElement = screen.getByText('Confirm');

      expect(dialogTitle).toBeVisible();
      expect(uploadFileButton).toBeVisible();
      expect(cancelButton).toBeVisible();
      expect(confirmButton).toBeVisible();

      act(() => userEvent.click(cancelButton));
      expect(dialogTitle).not.toBeVisible();
    }
  );

  test(
    'CourseResultsTable should show a dialog for exporting Sisu CSV'
    + ' when clicking on a export button',
    async () => {

      renderCourseResultsView();

      await waitFor( async () => {
        const selectAllCheckBox: HTMLInputElement = screen.getByLabelText('Select all');
        userEvent.click(selectAllCheckBox);
        expect(selectAllCheckBox).toBeChecked();

        const exportGradesMenuButton: HTMLElement = await screen.findByText('Export to Sisu CSV');
        expect(exportGradesMenuButton).toBeDefined();
        act(() => userEvent.click(exportGradesMenuButton));

        const dialogTitle: HTMLElement = screen.getByText('Export final grades to Sisu CSV');
        const exportButton: HTMLElement = screen.getByText('Export');
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
      userEvent.click(selectAllCheckBox);
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
