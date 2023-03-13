// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseView from '../components/CourseView';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import AuthContext from '../context/authProvider';
import mockCourses from '../mock-data/mockCourses';
import mockInstances from '../mock-data/mockInstancesWithStringDates';

jest.mock('../services/courses');
jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for CourseView component', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockRejectedValue('Network error');
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);


    const mockResponseCourse = { course: mockCourses.current[0] };
    coursesService.getCourse.mockRejectedValue('Network error');
    coursesService.getCourse.mockResolvedValue(mockResponseCourse);

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


  test('CourseView should render OngoingInstanceInfo, Assignments and InstancesTable components for teachers', async () => {

    const auth = { role: 'TEACHER' };
    const { getByText, getAllByText } = renderCourseView(auth);

    await waitFor(() => {
      const instanceInfo = getByText('Ongoing Instance');
      const teachersInfo = getByText('Teachers in Charge');         
      const assignments = getByText('Study Attainments');
      const exercises = getByText('Exercises');  // Assignment
      const projects = getByText('Project');  // Assignment
      const exams = getAllByText('Exam');  // Assignmnets and instance types
      const pastInstances = getByText('All Past Instances');
      const createInstanceButton = getByText('New instance');
      const addAssignmentButton = getByText('Add attainment');
      const seeAttendeesButton = getByText('See attendees');
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
    
  });

  test('CourseView should not render new instance button, see attendees or allow editing assignments for students', async () => {

    const auth = { role: 'STUDENT' };
    const { getByText, findByText, queryByText } = renderCourseView(auth);

    const instanceInfo = await findByText('Ongoing Instance');  // with the new animation, wait is needed before components are rendered
    const teachersInfo = getByText('Teachers in Charge');       // since previous is in document, so are the rest
    const pastInstances = getByText('All Past Instances');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(pastInstances).toBeDefined();

    expect(queryByText('Study Attainments')).not.toBeInTheDocument();
    expect(queryByText('Add attainment')).not.toBeInTheDocument();
    expect(queryByText('Edit')).not.toBeInTheDocument();
    expect(queryByText('See attendees')).not.toBeInTheDocument();
    
  });

  test('CourseView should allow changing the instance that is displayed in detail', async () => {

    const auth = { role: 'TEACHER' };
    const { getByText, findByText, findAllByRole } = renderCourseView(auth);

    const instanceRows = await findAllByRole('row');
    expect(instanceRows.length - 1).toEqual(mockInstances.length);    // - 1 because heading row

    const firstTeacherInCharge = await findByText('Elisa Mekler')
    expect(firstTeacherInCharge).toBeInTheDocument();

    userEvent.click(instanceRows[5]);   // click a row that isn't the first, changes teacher
    expect(await findByText('Kerttu Maaria Pollari-Malmi')).toBeInTheDocument();
    expect(firstTeacherInCharge).not.toBeInTheDocument();
  });

});
