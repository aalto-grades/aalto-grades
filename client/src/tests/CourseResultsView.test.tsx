// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseResultsView from '../components/CourseResultsView';

describe('Tests for CourseResultsView components', () => {

  const renderCourseResultsView = async () => {
    return render(
      <BrowserRouter>
        <CourseResultsView />
      </BrowserRouter>
    );
  };

  test('CourseResultsTable should render the correct number of rows', async () => {

    renderCourseResultsView();

    await waitFor(() => {
      const headingElement = screen.queryByText('Course Results');
      const studentIdHeader = screen.queryByText('Student ID');
      const finalGradeHeader = screen.queryByText('Final Grade');
      const viewValidGradesText = screen.queryByText('View valid grades from past instances:');
      const viewAllGradesButton = screen.queryByText('View all grades');
      const calculateGradesButton = screen.queryByText('Calculate final grades');

      expect(headingElement).toBeInTheDocument();
      expect(studentIdHeader).toBeInTheDocument();
      expect(finalGradeHeader).toBeInTheDocument();
      expect(viewValidGradesText).toBeInTheDocument();
      expect(viewAllGradesButton).toBeInTheDocument();
      expect(calculateGradesButton).toBeInTheDocument();
    });

  });

  test('CourseResultsTable should show a dialog for uploading a file when clicking on a menu button and choosing that option', async () => {

    renderCourseResultsView();

    const importGradesMenuButton = await screen.findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    userEvent.click(importGradesMenuButton);

    const uploadOption = screen.getByText('Import from file');
    expect(uploadOption).toBeDefined();
    userEvent.click(uploadOption);

    const dialogTitle = screen.getByText('Add Grades from File');
    const uploadFileButton = screen.getByText('Upload file');
    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    expect(dialogTitle).toBeVisible();
    expect(uploadFileButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();

    userEvent.click(cancelButton);
    expect(dialogTitle).not.toBeVisible();
  });

  test('CourseResultsTable should show a dialog for exporting Sisu CSV when clicking on a export button', async () => {

    renderCourseResultsView();

    const exportGradesMenuButton = await screen.findByText('Export to Sisu CSV');
    expect(exportGradesMenuButton).toBeDefined();
    userEvent.click(exportGradesMenuButton);

    const dialogTitle = screen.getByText('Export final grades to Sisu CSV');
    const exportButton = screen.getByText('Export');
    const cancelButton = screen.getByText('Cancel');

    expect(dialogTitle).toBeVisible();
    expect(exportButton).toBeVisible();
    expect(cancelButton).toBeVisible();

    userEvent.click(cancelButton);
    expect(dialogTitle).not.toBeVisible();
  });

  test('CourseResultsTable should not render any rows before grades are imported', async () => {

    renderCourseResultsView();

    const studentRows = await screen.findAllByRole('row');
    expect(studentRows.length).toEqual(1); // 25 rows are displayed by default + 1 for header row

  });

  test('CourseResultsView should display an alert when grade calculation is started', async () => {

    renderCourseResultsView();

    await waitFor( async () => {
      expect(await screen.queryByText('Calculating final grades...')).not.toBeInTheDocument();

      const calculateGradesButton = screen.queryByText('Calculate final grades');
      userEvent.click(calculateGradesButton);

      expect(await screen.findByText('Calculating final grades...')).toBeInTheDocument();
    });
  });

});