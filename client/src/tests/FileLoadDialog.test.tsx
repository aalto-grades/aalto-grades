// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult, SystemRole } from 'aalto-grades-common/types';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  act, cleanup, fireEvent, render, RenderResult, screen, waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CourseView from '../components/CourseView';

import * as assessmentModelServices from '../services/assessmentModels';
import * as attainmentServices from '../services/attainments';
import * as courseServices from '../services/courses';
import * as formulaServices from '../services/formulas';
import * as gradeServices from '../services/grades';
import * as instanceServices from '../services/instances';
import AuthContext from '../context/AuthProvider';
import { maxErrorsToShow } from '../components/course-view/FileLoadDialog';
import { mockAssessmentModels } from './mock-data/mockAssessmentModels';
import { mockAttainments } from './mock-data/mockAttainments';
import { mockCourses } from './mock-data/mockCourses';
import { mockFormulas } from './mock-data/mockFormulas';
import { mockInstances } from './mock-data/mockInstancesWithStringDates';

const file: File = new File(['idk'], 'grades_test.csv', { type: 'csv' });

jest.mock('../services/assessmentModels');
jest.mock('../services/attainments');
jest.mock('../services/courses');
jest.mock('../services/instances');
jest.mock('../services/grades');
afterEach(cleanup);

const mockErrorResponse: {
  status: number,
  data: {
    success: boolean,
    errors: Array<string>
  }
} = {
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

  function renderCourseView(auth: LoginResult): RenderResult {

    (instanceServices.getInstances as jest.Mock).mockResolvedValue(mockInstances);

    (courseServices.getCourse as jest.Mock).mockResolvedValue(mockCourses[0]);

    (assessmentModelServices.getAllAssessmentModels as jest.Mock)
      .mockResolvedValue(mockAssessmentModels);

    (attainmentServices.getAllAttainments as jest.Mock)
      .mockResolvedValue(mockAttainments);

    jest.spyOn(formulaServices, 'getFormulaDetails').mockResolvedValue(mockFormulas[0]);

    // succeess, nothing to worry about
    (gradeServices.importCsv as jest.Mock).mockResolvedValue({});

    return render(
      <MemoryRouter initialEntries={['/course-view/1']}>
        <AuthContext.Provider value={{
          auth: auth,
          setAuth: jest.fn(),
          isTeacherInCharge: false,
          setIsTeacherInCharge: jest.fn()
        }}>
          <Routes>
            <Route path='/course-view/:courseId' element={<CourseView/>}/>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  test('FileLoadDialog should render', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth: LoginResult = {
      id: 1,
      name: 'Admin',
      role: SystemRole.Admin
    };

    const { getByText, findByText }: RenderResult = renderCourseView(auth);

    const importGradesMenuButton: HTMLElement = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption: HTMLElement = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle: HTMLElement = getByText('Add Grades from File');
    const uploadFileButton: HTMLElement = getByText('Upload file');
    const cancelButton: HTMLElement = getByText('Cancel');
    const confirmButton: HTMLElement = getByText('Confirm');

    expect(dialogTitle).toBeVisible();
    expect(uploadFileButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();

    act(() => userEvent.click(cancelButton));
    expect(dialogTitle).not.toBeVisible();

  });

  test(
    'FileLoadDialog should show error when trying to submit without selecting file',
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText, findByText }: RenderResult = renderCourseView(auth);

      const importGradesMenuButton: HTMLElement = await findByText('Import grades');
      expect(importGradesMenuButton).toBeDefined();
      act(() => userEvent.click(importGradesMenuButton));

      const uploadOption: HTMLElement = getByText('Import from file');
      expect(uploadOption).toBeDefined();
      act(() => userEvent.click(uploadOption));

      const dialogTitle: HTMLElement = getByText('Add Grades from File');
      const confirmButton: HTMLElement = getByText('Confirm');

      act(() => userEvent.click(confirmButton));
      expect(dialogTitle).toBeVisible();

      const validationError: HTMLElement = await findByText('You must select a csv file to submit');
      expect(validationError).toBeVisible();
    }
  );

  test('FileLoadDialog should close when submitted file is okay', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth: LoginResult = {
      id: 1,
      name: 'Admin',
      role: SystemRole.Admin
    };

    const { getByText, findByText }: RenderResult = renderCourseView(auth);

    const importGradesMenuButton: HTMLElement = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption: HTMLElement = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle: HTMLElement = getByText('Add Grades from File');

    await waitFor(() =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]')!, {
        target: { files: [file] },
      })
    );

    const confirmButton: HTMLElement = getByText('Confirm');
    act(() => userEvent.click(confirmButton));

    await waitFor(() => expect(dialogTitle).not.toBeVisible());
  });

});

describe('FileLoadDialog test where server does not accept the file', () => {

  function renderCourseView(auth: LoginResult): RenderResult {

    (instanceServices.getInstances as jest.Mock).mockResolvedValue(mockInstances);

    (courseServices.getCourse as jest.Mock).mockResolvedValue(mockCourses[0]);

    (assessmentModelServices.getAllAssessmentModels as jest.Mock)
      .mockResolvedValue(mockAssessmentModels);

    (attainmentServices.getAllAttainments as jest.Mock)
      .mockResolvedValue(mockAttainments);

    jest.spyOn(formulaServices, 'getFormulaDetails').mockResolvedValue(mockFormulas[0]);

    // Mock the error.
    (gradeServices.importCsv as jest.Mock).mockRejectedValue({
      response: mockErrorResponse
    });

    return render(
      <MemoryRouter initialEntries={['/course-view/1']}>
        <AuthContext.Provider value={{
          auth: auth,
          setAuth: jest.fn(),
          isTeacherInCharge: false,
          setIsTeacherInCharge: jest.fn()
        }}>
          <Routes>
            <Route path='/course-view/:courseId' element={<CourseView />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  test('FileLoadDialog should not close with bad csv', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth: LoginResult = {
      id: 1,
      name: 'Admin',
      role: SystemRole.Admin
    };

    const { getByText, findByText }: RenderResult = renderCourseView(auth);

    const importGradesMenuButton: HTMLElement = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    act(() => userEvent.click(importGradesMenuButton));

    const uploadOption: HTMLElement = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    act(() => userEvent.click(uploadOption));

    const dialogTitle: HTMLElement = getByText('Add Grades from File');

    await waitFor(() =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]')!, {
        target: { files: [file] },
      })
    );

    const confirmButton: HTMLElement = getByText('Confirm');
    act(() => userEvent.click(confirmButton));

    expect(dialogTitle).toBeVisible();
    const errorInstructions: HTMLElement = await findByText(
      'The input file cannot be processed due to the following issues that'
      + ' must be addressed and fixed:'
    );
    expect(errorInstructions).toBeVisible();

    // First n errors should be rendered visible.
    for (let i: number = 0; i < maxErrorsToShow; i++) {
      const errorText: HTMLElement = await findByText(mockErrorResponse.data.errors[i]);
      expect(errorText).toBeVisible();
    }

    // Rest of the errors indicated by total number of extra errors (not listed initially).
    const additionalErrors: HTMLElement = await findByText(
      `And ${mockErrorResponse.data.errors.length - maxErrorsToShow} more errors found`,
      { exact: false }
    );
    expect(additionalErrors).toBeVisible();

    // Show all errors button should be visible.
    expect(screen.getByText('Show all')).toBeDefined();
  });

  test(
    'FileLoadDialog should not render show all errors button if amount of'
    + `errors less or equal to limit of ${maxErrorsToShow}`,
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText, findByText }: RenderResult = renderCourseView(auth);

      const importGradesMenuButton: HTMLElement = await findByText('Import grades');
      expect(importGradesMenuButton).toBeDefined();
      act(() => userEvent.click(importGradesMenuButton));

      const uploadOption: HTMLElement = getByText('Import from file');
      expect(uploadOption).toBeDefined();
      act(() => userEvent.click(uploadOption));

      const dialogTitle: HTMLElement = getByText('Add Grades from File');

      await waitFor(() =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fireEvent.change(getByText('Upload file').querySelector('input[type="file"]')!, {
          target: { files: [file] },
        })
      );

      // Include only maxErrorsToShow amount of error messages to test conditional rendering.
      (gradeServices.importCsv as jest.Mock).mockRejectedValue({
        response: {
          status: mockErrorResponse.status,
          data: {
            success: mockErrorResponse.data.success,
            errors: mockErrorResponse.data.errors.slice(0, maxErrorsToShow)
          }
        }
      });

      const confirmButton: HTMLElement = getByText('Confirm');
      act(() => userEvent.click(confirmButton));

      expect(dialogTitle).toBeVisible();
      const errorInstructions: HTMLElement = await findByText(
        'The input file cannot be processed due to the following issues'
        + ' that must be addressed and fixed:'
      );
      expect(errorInstructions).toBeVisible();

      for (let i: number = 0; i < maxErrorsToShow; i++) {
        const errorText: HTMLElement = await findByText(mockErrorResponse.data.errors[i]);
        expect(errorText).toBeVisible();
      }

      // Additional errors text should not be rendered.
      expect(screen.queryByText('more errors found')).toBeNull();
      expect(screen.queryByText('Show all')).toBeNull();
    });
});
