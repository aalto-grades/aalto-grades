// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult, waitFor, cleanup } from '@testing-library/react';
import CourseView from '../components/CourseView';
import assessmentModelsService from '../services/assessmentModels';
import attainmentService from '../services/attainments';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import AuthContext from '../context/AuthProvider';
import mockAssessmentModels from './mock-data/mockAssessmentModels';
import mockAttainments from './mock-data/mockAttainments';
import mockCourses from './mock-data/mockCourses';
import mockInstances from './mock-data/mockInstancesWithStringDates';
import {
  AssessmentModelData, AttainmentData, CourseInstanceData, LoginResult, SystemRole
} from 'aalto-grades-common/types';

jest.mock('../services/assessmentModels');
jest.mock('../services/attainments');
jest.mock('../services/courses');
jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for CourseView component', () => {

  function renderCourseView(
    auth: LoginResult,
    mockInstances: Array<CourseInstanceData>,
    mockAssessmentModels: Array<AssessmentModelData>,
    mockAttainments: AttainmentData
  ): RenderResult {

    (instancesService.getInstances as jest.Mock).mockRejectedValue('Network error');
    (instancesService.getInstances as jest.Mock).mockResolvedValue(mockInstances);

    (coursesService.getCourse as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getCourse as jest.Mock).mockResolvedValue(mockCourses[0]);

    (assessmentModelsService.getAllAssessmentModels as jest.Mock)
      .mockRejectedValue('Network error');
    (assessmentModelsService.getAllAssessmentModels as jest.Mock)
      .mockResolvedValue(mockAssessmentModels);

    (attainmentService.getAllAttainments as jest.Mock).mockRejectedValue('Network error');
    (attainmentService.getAllAttainments as jest.Mock).mockResolvedValue(mockAttainments);

    return render(
      <MemoryRouter initialEntries={['/course-view/1']}>
        <AuthContext.Provider value={{ auth }}>
          <Routes>
            <Route path='/course-view/:courseId' element={<CourseView/>}/>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  test(
    'CourseView should render CourseDetails, Attainments and InstancesTable'
    + ' components for teachers of the course',
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText, getAllByText }: RenderResult = renderCourseView(
        auth, mockInstances, mockAssessmentModels, mockAttainments
      );

      await waitFor(() => {
        expect(getByText('Course Details')).toBeDefined();
        expect(getByText('Teachers in Charge')).toBeDefined();
        expect(getByText('Assessment Models')).toBeDefined();
        expect(getByText('Study Attainments')).toBeDefined();
        expect(getByText('Exercises (')).toBeDefined();
        expect(getByText('Project (')).toBeDefined();
        expect(getAllByText('Exam (')).toBeDefined();
        expect(getByText('Course Instances')).toBeDefined();
        expect(getByText('New instance')).toBeDefined();
        expect(getByText('Add attainment')).toBeDefined();
        expect(getAllByText('Edit')).toBeDefined();
      });

    }
  );

  test(
    'CourseView should not render new instance button or allow'
    + ' editing attainments for students',
    async () => {

      const auth: LoginResult = {
        id: 2,
        name: 'User',
        role: SystemRole.User
      };

      const { getByText, findByText, queryByText }: RenderResult =
        renderCourseView(auth, mockInstances, mockAssessmentModels, mockAttainments);

      const courseInfo: HTMLElement = await findByText('Course Details');
      // since previous is in document, so are the rest
      const teachersInfo: HTMLElement = getByText('Teachers in Charge');
      const instances: HTMLElement = getByText('Course Instances');

      expect(courseInfo).toBeDefined();
      expect(teachersInfo).toBeDefined();
      expect(instances).toBeDefined();

      expect(queryByText('Study Attainments')).not.toBeInTheDocument();
      expect(queryByText('Add attainment')).not.toBeInTheDocument();
      expect(queryByText('Edit')).not.toBeInTheDocument();

    }
  );

  test(
    'CourseView InstancesTable should display correct message if no instances found for the course',
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText }: RenderResult = renderCourseView(
        auth, [], mockAssessmentModels, mockAttainments
      );

      await waitFor(() => {
        const noInstances: HTMLElement = getByText(
          'No instances found for course, please create a new instance.'
        );
        expect(noInstances).toBeDefined();
      });

    }
  );

  test(
    'CourseView assessment models should display correct message if no models found for the course',
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText }: RenderResult = renderCourseView(
        auth, mockInstances, [], mockAttainments
      );

      await waitFor(() => {
        const noAssessmentModels: HTMLElement = getByText(
          'No assesment models found. Please create a new assessment model.'
        );
        expect(noAssessmentModels).toBeDefined();
      });

    }
  );

  test(
    'CourseView should display correct message if no attainments found specific assessment model',
    async () => {

      // TODO, role here must be checked here based on a course/instance level role.
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      const { getByText }: RenderResult = renderCourseView(
        auth, mockInstances, [], mockAttainments
      );

      await waitFor(() => {
        const noAttainments: HTMLElement = getByText(
          'No attainments found, please select at least one assessment model or create a new one.'
        );
        expect(noAttainments).toBeDefined();
      });

    }
  );

});
