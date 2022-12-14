// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseView from '../components/CourseView';
import sortingServices from '../services/sorting';

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
    expect(teachersInfo ).toBeDefined();
    expect(assignments).toBeDefined();
    expect(exercises).toBeDefined();
    expect(projects).toBeDefined();
    expect(exams).toBeDefined();
    expect(pastInstances).toBeDefined();
    expect(exampleOfInstancePeriod).toBeDefined();
    
  });

  test('sortByDate should correcty arrange dates in a descending order', () => {
  
    const dates = [new Date(2019, 8, 9), new Date(2021, 8, 14), new Date(2019, 11, 8), 
      new Date(2020, 8, 8), new Date(2020, 11, 7), new Date(2021, 11, 13)];

    const correctlyOrderedDates = [new Date(2021, 11, 13), new Date(2021, 8, 14), new Date(2020, 11, 7),
      new Date(2020, 8, 8), new Date(2019, 11, 8), new Date(2019, 8, 9)];

    dates.sort((a, b) => sortingServices.sortByDate(a, b));
    
    expect(dates).toStrictEqual(correctlyOrderedDates);
  });

});