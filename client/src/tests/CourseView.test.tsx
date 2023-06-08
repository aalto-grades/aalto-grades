// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseView from '../components/CourseView';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import AuthContext from '../context/authProvider';
import mockCourses from '../mock-data/mockCourses';
import mockInstances from '../mock-data/mockInstancesWithStringDates';
import { SystemRole } from 'aalto-grades-common/types/general';

jest.mock('../services/courses');
jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for CourseView component', () => {

  const renderCourseView = (auth) => {

    const mockResponseInstances = { courseInstances: mockInstances };
    instancesService.getInstances.mockRejectedValue('Network error');
    instancesService.getInstances.mockResolvedValue(mockResponseInstances);


    const mockResponseCourse = { course: mockCourses[0] };
    (coursesService.getCourse as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getCourse as jest.Mock).mockResolvedValue(mockResponseCourse);

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


  test('CourseView should render InstanceDetails, Attainments and InstancesTable components for teachers of the course', async () => {

    // TODO, role here must be checked here based on a course/instance level role.
    const auth = { role: SystemRole.Admin };
    const { getByText, getAllByText } = renderCourseView(auth);

    await waitFor(() => {
      const instanceInfo = getByText('Instance Details');
      const teachersInfo = getByText('Teachers in Charge');
      const attainments = getByText('Study Attainments');
      const exercises = getByText('Exercises');
      const projects = getByText('Project');
      const exams = getAllByText('Exam');
      const instances = getByText('All Instances');
      const createInstanceButton = getByText('New instance');
      const addAttainmentButton = getByText('Add attainment');
      expect(instanceInfo).toBeDefined();
      expect(teachersInfo).toBeDefined();
      expect(attainments).toBeDefined();
      expect(exercises).toBeDefined();
      expect(projects).toBeDefined();
      expect(exams).toBeDefined();
      expect(instances).toBeDefined();
      expect(createInstanceButton).toBeDefined();
      expect(addAttainmentButton).toBeDefined();
    });

  });

  test('CourseView should not render new instance button, see attendees or allow editing attainments for students', async () => {

    const auth = { role: SystemRole.User };
    const { getByText, findByText, queryByText } = renderCourseView(auth);

    const instanceInfo = await findByText('Instance Details');  // with the new animation, wait is needed before components are rendered
    const teachersInfo = getByText('Teachers in Charge');       // since previous is in document, so are the rest
    const instances = getByText('All Instances');

    expect(instanceInfo).toBeDefined();
    expect(teachersInfo).toBeDefined();
    expect(instances).toBeDefined();

    expect(queryByText('Study Attainments')).not.toBeInTheDocument();
    expect(queryByText('Add attainment')).not.toBeInTheDocument();
    expect(queryByText('Edit')).not.toBeInTheDocument();
    expect(queryByText('See attendees')).not.toBeInTheDocument();

  });

  test('CourseView should allow changing the instance that is displayed in detail', async () => {

    const auth = { role: SystemRole.User };
    const { findByText, findAllByRole } = renderCourseView(auth);

    const instanceRows = await findAllByRole('row');
    expect(instanceRows.length - 1).toEqual(mockInstances.length);    // - 1 because heading row

    const firstTeacherInCharge = await findByText('Elisa Mekler');
    expect(firstTeacherInCharge).toBeInTheDocument();

    act(() => userEvent.click(instanceRows[5]));   // click a row that isn't the first, changes teacher
    expect(await findByText('Kerttu Maaria Pollari-Malmi')).toBeInTheDocument();
    expect(firstTeacherInCharge).not.toBeInTheDocument();
  });

});
