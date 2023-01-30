// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseView from '../components/CourseView';

describe('Tests for CourseView component', () => {

  test('CourseView should render OngoingInstanceInfo, Assignments and InstancesTable components', () => {

    render(
      <BrowserRouter>
        <CourseView />
      </BrowserRouter>
    );

    const instanceInfo = screen.getByText('Ongoing instance');
    const teachersInfo = screen.getByText('Responsible Teachers');
    const assignments = screen.getByText('Partial Assignments');
    const exercises = screen.getByText('Exercises');
    const projects = screen.getByText('Projects');
    const exams = screen.getByText('Exams');
    const pastInstances = screen.getByText('Past Instances');
    const exampleOfInstancePeriod = screen.getByText('2020-2021 Autumn I-II');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(assignments).toBeDefined();
    expect(exercises).toBeDefined();
    expect(projects).toBeDefined();
    expect(exams).toBeDefined();
    expect(pastInstances).toBeDefined();
    expect(exampleOfInstancePeriod).toBeDefined();
    
  });

});