// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseResultsView from '../components/CourseResultsView';

describe('Tests for CourseResultsView components', () => {

  function renderCourseResultsView(): RenderResult {
    return render(
      <BrowserRouter>
        <CourseResultsView />
      </BrowserRouter>
    );
  }

  test('CourseResultsTable should render the correct number of rows', async () => {

    renderCourseResultsView();

    await waitFor(() => {
      const headingElement: HTMLElement = screen.queryByText('Course Results');
      const studentNumberHeader: HTMLElement = screen.queryByText('Student Number');
      const finalGradeHeader: HTMLElement = screen.queryByText('Final Grade');
      const viewValidGradesText: HTMLElement = screen.queryByText(
        'View valid grades from past instances:'
      );
      const viewAllGradesButton: HTMLElement = screen.queryByText('View all grades');
      const calculateGradesButton: HTMLElement = screen.queryByText('Calculate final grades');

      expect(headingElement).toBeInTheDocument();
      expect(studentNumberHeader).toBeInTheDocument();
      expect(finalGradeHeader).toBeInTheDocument();
      expect(viewValidGradesText).toBeInTheDocument();
      expect(viewAllGradesButton).toBeInTheDocument();
      expect(calculateGradesButton).toBeInTheDocument();
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
      expect(await screen.queryByText('Calculating final grades...')).not.toBeInTheDocument();

      const calculateGradesButton: HTMLElement = screen.queryByText('Calculate final grades');
      act(() => userEvent.click(calculateGradesButton));

      expect(await screen.findByText('Calculating final grades...')).toBeInTheDocument();
    });
  });

});
