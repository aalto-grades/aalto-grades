// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCourseView from '../components/CreateCourseView';
import CreateCourseForm from '../components/create-course-view/CreateCourseForm';

describe('Tests for CreateCourseView components', () => {

  test(
    'CreateCourseView should render the CreateCourseForm and contain'
    + ' all of the appropriate components',
    () => {

      render(
        <BrowserRouter>
          <CreateCourseView />
        </BrowserRouter>
      );

      const headingElement = screen.getByText('Create a New Course');
      const codeField = screen.getByLabelText('Course Code');
      const nameField = screen.getByLabelText('Course Name');
      const organizerField = screen.getByLabelText('Organizer');
      const creationButton = screen.getByText('Create Course');

      expect(headingElement).toBeDefined();
      expect(codeField).toBeDefined();
      expect(nameField).toBeDefined();
      expect(organizerField).toBeDefined();
      expect(creationButton).toBeDefined();
    }
  );

  test('CreateCourseForm should allow an admin to create a course', () => {

    const mockCourse = jest.fn();

    const testCode = 'Test code';
    const testName = 'Test name';
    const testDepartment = 'Test department';

    render(<CreateCourseForm addCourse={mockCourse} />);

    const codeField = screen.getByLabelText('Course Code');
    const nameField = screen.getByLabelText('Course Name');
    const organizerField = screen.getByLabelText('Organizer');
    const creationButton = screen.getByText('Create Course');

    act(() => userEvent.type(codeField, testCode));
    act(() => userEvent.type(nameField, testName));
    act(() => userEvent.type(organizerField, testDepartment));
    act(() => userEvent.click(creationButton));

    expect(mockCourse).toHaveBeenCalledTimes(1);
    expect(mockCourse).toHaveBeenCalledWith({
      id: -1,
      courseCode: testCode,
      minCredits: 5,
      maxCredits: 5,
      department: {
        fi: '',
        sv: '',
        en: testDepartment,
      },
      name: {
        fi: '',
        sv: '',
        en: testName,
      },
      evaluationInformation: {
        fi: '',
        sv: '',
        en: '',
      }
    });
  });

});
