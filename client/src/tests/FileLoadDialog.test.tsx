// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, waitFor, cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseView from '../components/CourseView';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import gradesService from '../services/grades';
import AuthContext from '../context/authProvider';
import mockCourses from './mock-data/mockCourses';
import mockInstances from './mock-data/mockInstancesWithStringDates';
import { maxErrorsToShow } from '../components/course-view/FileLoadDialog';
import { SystemRole } from 'aalto-grades-common/types/auth';

const file = new File(['idk'], 'grades_test.csv', { type: 'csv' });

jest.mock('../services/courses');
jest.mock('../services/instances');
jest.mock('../services/grades');
afterEach(cleanup);

const mockErrorResponse = {
  status: 400,
  data: {
    success: false,
    errors: [
      'CSV file row 2 column 3 expected number, received "xx"',
      'CSV file row 5 column 6 expected number, received "yy"',
      'CSV file row 7 column 7 expected number, received "cc"',
      'CSV file row 12 column 2 expected number, received "hh"',
      'CSV file row 16 column 1 expected number, received "ww"',
      'CSV file row 22 column 9 expected number, received "uu"',
      'CSV file row 26 column 4 expected number, received "ii"',
      'CSV file row 39 column 3 expected number, received "oo"',
      'CSV file row 45 column 8 expected number, received "pp"'
    ]
  }
};

describe('FileLoadDialog test with proper csv', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);

    const mockResponseCourse = { course: mockCourses[0] };
    (coursesService.getCourse as jest.Mock).mockResolvedValue(mockResponseCourse);

    gradesService.importCsv.mockResolvedValue({}); // succeess, nothing to worry about

    return render(
      <MemoryRouter initialEntries={['/course-view/1']}>
        <AuthContext.Provider value={{ auth }}>
          <Routes>
            <Route path='/course-view/:courseId' element={<CourseView/>}/>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('FileLoadDialog should render', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth = { role: SystemRole.Admin };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle = getByText('Add Grades from File');
    const uploadFileButton = getByText('Upload file');
    const cancelButton = getByText('Cancel');
    const confirmButton = getByText('Confirm');

    expect(dialogTitle).toBeVisible();
    expect(uploadFileButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();

    act(() => userEvent.click(cancelButton));
    expect(dialogTitle).not.toBeVisible();

  });

  test('FileLoadDialog should show error when trying to submit without selecting file', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth = { role: SystemRole.Admin };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle = getByText('Add Grades from File');
    const confirmButton = getByText('Confirm');

    act(() => userEvent.click(confirmButton));
    expect(dialogTitle).toBeVisible();

    const validationError = await findByText('You must select a csv file to submit');
    expect(validationError).toBeVisible();
  });

  test('FileLoadDialog should close when submitted file is okay', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth = { role: SystemRole.Admin };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle = getByText('Add Grades from File');

    await waitFor(() =>
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]'), {
        target: { files: [file] },
      })
    );

    const confirmButton = getByText('Confirm');
    await act(async () => await userEvent.click(confirmButton));

    expect(dialogTitle).not.toBeVisible();
  });

});

describe('FileLoadDialog test where server does not accept the file', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);

    const mockResponseCourse = { course: mockCourses[0] };
    (coursesService.getCourse as jest.Mock).mockResolvedValue(mockResponseCourse);

    // Mock the error.
    gradesService.importCsv.mockRejectedValue({
      response: mockErrorResponse
    });

    return render(
      <MemoryRouter initialEntries={['/course-view/1']}>
        <AuthContext.Provider value={{ auth }}>
          <Routes>
            <Route path='/course-view/:courseId' element={<CourseView/>}/>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('FileLoadDialog should not close with bad csv', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth = { role: SystemRole.Admin };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle = getByText('Add Grades from File');

    await waitFor(() =>
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]'), {
        target: { files: [file] },
      })
    );

    const confirmButton = getByText('Confirm');
    act(() => userEvent.click(confirmButton));

    expect(dialogTitle).toBeVisible();
    const errorInstructions = await findByText(
      'The input file cannot be processed due to the following issues that must be addressed and fixed:'
    );
    expect(errorInstructions).toBeVisible();

    // First n errors should be rendered visible.
    for (let i = 0; i < maxErrorsToShow; i++) {
      const errorText = await findByText(mockErrorResponse.data.errors[i]);
      expect(errorText).toBeVisible();
    }

    // Rest of the errors indicated by total number of extra errors (not listed initially).
    const additionalErrors = await findByText(
      `And ${mockErrorResponse.data.errors.length - maxErrorsToShow} more errors found`,
      { exact: false }
    );
    expect(additionalErrors).toBeVisible();

    // Show all errors button should be visible.
    const showErrorsButton = screen.queryByText('Show all');
    expect(showErrorsButton).toBeDefined();
  });

  test(
    `FileLoadDialog should not render show all errors button if amount of errors less or equal to limit of ${maxErrorsToShow}`,
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth = { role: SystemRole.Admin };
      const { getByText, findByText } = renderCourseView(auth);

      const importGradesMenuButton = await findByText('Import grades');
      expect(importGradesMenuButton).toBeDefined();
      act(() => userEvent.click(importGradesMenuButton));

      const uploadOption = getByText('Import from file');
      expect(uploadOption).toBeDefined();
      act(() => userEvent.click(uploadOption));

      const dialogTitle = getByText('Add Grades from File');

      await waitFor(() =>
        fireEvent.change(getByText('Upload file').querySelector('input[type="file"]'), {
          target: { files: [file] },
        })
      );

      // Include only maxErrorsToShow amount of error messages to test conditional rendering.
      gradesService.importCsv.mockRejectedValue({
        response: {
          status: mockErrorResponse.status,
          data: {
            success: mockErrorResponse.data.success,
            errors: mockErrorResponse.data.errors.slice(0, maxErrorsToShow)
          }
        }
      });

      const confirmButton = getByText('Confirm');
      act(() => userEvent.click(confirmButton));

      expect(dialogTitle).toBeVisible();
      const errorInstructions = await findByText(
        'The input file cannot be processed due to the following issues that must be addressed and fixed:'
      );
      expect(errorInstructions).toBeVisible();

      for (let i = 0; i < maxErrorsToShow; i++) {
        const errorText = await findByText(mockErrorResponse.data.errors[i]);
        expect(errorText).toBeVisible();
      }

      // Additional errors text should not be rendered.
      const additionalErrors = screen.queryByText('more errors found');
      expect(additionalErrors).toBeNull();

      const showErrorsButton = screen.queryByText('Show all');
      expect(showErrorsButton).toBeNull();
    });
});
