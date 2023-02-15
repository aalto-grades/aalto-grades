// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import CourseView from '../components/CourseView';
import AuthContext from '../context/authProvider';

describe('Tests for CourseView component', () => {

  const renderCourseView = (auth) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <CourseView />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };


  test('CourseView should render OngoingInstanceInfo, Assignments and InstancesTable components for teachers', () => {

    const auth = { role: 'TEACHER' };
    renderCourseView(auth);

    const instanceInfo = screen.getByText('Ongoing instance');
    const teachersInfo = screen.getByText('Responsible Teachers');
    const assignments = screen.getByText('Assignments');
    const exercises = screen.getByText('Exercises');
    const projects = screen.getByText('Projects');
    const exams = screen.getByText('Exams');
    const pastInstances = screen.getByText('Past Instances');
    const createInstanceButton = screen.getByText('New instance');
    const addAssignmentButton = screen.getByText('Add assignment');
    const seeAttendeesButton = screen.getByText('See attendees');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(assignments).toBeDefined();
    expect(exercises).toBeDefined();
    expect(projects).toBeDefined();
    expect(exams).toBeDefined();
    expect(pastInstances).toBeDefined();
    expect(createInstanceButton).toBeDefined();
    expect(addAssignmentButton).toBeDefined();
    expect(seeAttendeesButton).toBeDefined();
    
  });

  test('CourseView should not render new instance button, see attendees or allow editing assignments for students', () => {

    const auth = { role: 'STUDENT' };
    renderCourseView(auth);

    const instanceInfo = screen.getByText('Ongoing instance');
    const teachersInfo = screen.getByText('Responsible Teachers');
    const pastInstances = screen.getByText('Past Instances');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(pastInstances).toBeDefined();

    expect(screen.queryByText('Assignments')).not.toBeInTheDocument();
    expect(screen.queryByText('Add assignment')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('See attendees')).not.toBeInTheDocument();
    
  });

});