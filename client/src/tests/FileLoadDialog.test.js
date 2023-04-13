// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import CourseView from '../components/CourseView';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import gradesService from '../services/grades';
import AuthContext from '../context/authProvider';
import mockCourses from '../mock-data/mockCourses';
import mockInstances from '../mock-data/mockInstancesWithStringDates';

let file = new File(['idk'], 'grades_test.csv', { type: 'csv' });

jest.mock('../services/courses');
jest.mock('../services/instances');
jest.mock('../services/grades');
afterEach(cleanup);

describe('FileLoadDialog test with proper csv', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);

    const mockResponseCourse = { course: mockCourses.current[0] };
    coursesService.getCourse.mockResolvedValue(mockResponseCourse);

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

    const auth = { role: 'TEACHER' };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    userEvent.click(importGradesMenuButton);

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    userEvent.click(uploadOption);

    const dialogTitle = getByText('Add Grades from File');
    const uploadFileButton = getByText('Upload file');
    const cancelButton = getByText('Cancel');
    const confirmButton = getByText('Confirm');

    expect(dialogTitle).toBeVisible();
    expect(uploadFileButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();

    userEvent.click(cancelButton);
    expect(dialogTitle).not.toBeVisible();
    
  });

  test('FileLoadDialog should show error when tyring to submit without selecting file', async () => {

    const auth = { role: 'TEACHER' };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    userEvent.click(importGradesMenuButton);

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    userEvent.click(uploadOption);

    const dialogTitle = getByText('Add Grades from File');
    const confirmButton = getByText('Confirm');

    userEvent.click(confirmButton);
    expect(dialogTitle).toBeVisible();

    const validationError = await findByText('You must select a csv file to submit');
    expect(validationError).toBeVisible();
  });

  test('FileLoadDialog should close when submitted file is okay', async () => {

    const auth = { role: 'TEACHER' };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    userEvent.click(importGradesMenuButton);

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    userEvent.click(uploadOption);

    const dialogTitle = getByText('Add Grades from File');

    await waitFor(() =>
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]'), {
        target: { files: [file] },
      })
    )

    const confirmButton = getByText('Confirm');
    await act(async () => await userEvent.click(confirmButton));

    expect(dialogTitle).not.toBeVisible();
  });

});

describe('FileLoadDialog test where server does not accept the file', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);

    const mockResponseCourse = { course: mockCourses.current[0] };
    coursesService.getCourse.mockResolvedValue(mockResponseCourse);

    gradesService.importCsv.mockRejectedValue({ response: { data: { errors: ['Error 1', 'Error 2'] } } }); // mock the error

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

    const auth = { role: 'TEACHER' };
    const { getByText, findByText } = renderCourseView(auth);

    const importGradesMenuButton = await findByText('Import grades');
    expect(importGradesMenuButton).toBeDefined();
    userEvent.click(importGradesMenuButton);

    const uploadOption = getByText('Import from file');
    expect(uploadOption).toBeDefined();
    userEvent.click(uploadOption);

    const dialogTitle = getByText('Add Grades from File');

    await waitFor(() =>
      fireEvent.change(getByText('Upload file').querySelector('input[type="file"]'), {
        target: { files: [file] },
      })
    )
    
    const confirmButton = getByText('Confirm');
    userEvent.click(confirmButton);
    
    expect(dialogTitle).toBeVisible();
    const errorInstructions = await findByText('The input file could not be processed because of the issues listed below. They need to be fixed.');
    expect(errorInstructions).toBeVisible();
  
  });

});
