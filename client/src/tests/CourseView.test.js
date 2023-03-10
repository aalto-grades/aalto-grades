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

    const instanceInfo = screen.getByText('Ongoing Instance');
    const teachersInfo = screen.getByText('Teachers in Charge');
    const attainments = screen.getByText('Study Attainments');
    const exercises = screen.getByText('Exercises');  // Attainment
    const projects = screen.getByText('Project');  // Attainment
    const exams = screen.getAllByText('Exam');  // Attainments and instance types
    const pastInstances = screen.getByText('Past Instances');
    const createInstanceButton = screen.getByText('New instance');
    const addAttainmentButton = screen.getByText('Add attainment');
    const seeAttendeesButton = screen.getByText('See attendees');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(attainments).toBeDefined();
    expect(exercises).toBeDefined();
    expect(projects).toBeDefined();
    expect(exams).toBeDefined();
    expect(pastInstances).toBeDefined();
    expect(createInstanceButton).toBeDefined();
    expect(addAttainmentButton).toBeDefined();
    expect(seeAttendeesButton).toBeDefined();
    
  });

  test('CourseView should not render new instance button, see attendees or allow editing attainments for students', () => {

    const auth = { role: 'STUDENT' };
    renderCourseView(auth);

    const instanceInfo = screen.getByText('Ongoing Instance');
    const teachersInfo = screen.getByText('Teachers in Charge');
    const pastInstances = screen.getByText('Past Instances');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(pastInstances).toBeDefined();

    expect(screen.queryByText('Study Attainments')).not.toBeInTheDocument();
    expect(screen.queryByText('Add attainment')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('See attendees')).not.toBeInTheDocument();
    
  });

});