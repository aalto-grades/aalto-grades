// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateCourseView from '../components/CreateCourseView';
import CreateCourseForm from '../components/create-course-view/CreateCourseForm';
import { BrowserRouter } from 'react-router-dom';

describe('Tests for CreateCourseView components', () => {

  test('CreateCourseView should render the CreateCourseForm and contain all of the appropriate components', () => {

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
  }),

  test('CreateCourseForm should allow an admin to create a course', () => {

    const mockCourse= jest.fn();

    render(<CreateCourseForm addCourse={mockCourse}/>);

    const codeField = screen.getByLabelText('Course Code');
    const nameField = screen.getByLabelText('Course Name');
    const organizerField = screen.getByLabelText('Organizer');
    const creationButton = screen.getByText('Create Course');

    userEvent.type(codeField, 'Test code');
    userEvent.type(nameField, 'Test name');
    userEvent.type(organizerField, 'Test department');
    userEvent.click(creationButton);

    expect(mockCourse).toHaveBeenCalledTimes(1);
    expect(mockCourse).toHaveBeenCalledWith({
        id: 100,
        courseCode: 'Test code',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Test department',
        },
        name: {
          fi: '',
          sv: '',
          en: 'Test name',
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: 'General scale, 0-5',
        }
    });
  });

});
