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

      const headingElement: HTMLElement = screen.getByText('Create a New Course');
      const codeField: HTMLElement = screen.getByLabelText('Course Code');
      const nameField: HTMLElement = screen.getByLabelText('Course Name');
      const organizerField: HTMLElement = screen.getByLabelText('Organizer');
      const creationButton: HTMLElement = screen.getByText('Create Course');

      expect(headingElement).toBeDefined();
      expect(codeField).toBeDefined();
      expect(nameField).toBeDefined();
      expect(organizerField).toBeDefined();
      expect(creationButton).toBeDefined();
    }
  );

  test('CreateCourseForm should allow an admin to create a course', () => {

    const mockCourse: jest.Mock = jest.fn();

    const testCode: string = 'Test code';
    const testName: string = 'Test name';
    const testDepartment: string = 'Test department';

    render(<CreateCourseForm addCourse={mockCourse} />);

    const codeField: HTMLElement = screen.getByLabelText('Course Code');
    const nameField: HTMLElement = screen.getByLabelText('Course Name');
    const organizerField: HTMLElement = screen.getByLabelText('Organizer');
    const creationButton: HTMLElement = screen.getByText('Create Course');

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
      },
      teachersInCharge: [
        {
          id: 23,
          name: "Elon Musk",
        },
      ]
    });
  });

});
