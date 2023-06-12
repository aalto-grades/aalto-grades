// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import AllCoursesView from '../components/AllCoursesView';
import coursesService from '../services/courses';
import AuthContext from '../context/authProvider';
import mockCourses from './mock-data/mockCourses';
import { SystemRole } from 'aalto-grades-common/types/auth';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Tests for FrontPage component', () => {

  const renderAllCoursesView = async (auth) => {

    const mockResponse = { courses: mockCourses };

    (coursesService.getAllCourses as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getAllCourses as jest.Mock).mockResolvedValue(mockResponse);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <AllCoursesView />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('AllCoursesView should render all courses regardless of user role', async () => {
    const auth = { role: null };
    renderAllCoursesView(auth);

    await waitFor(() => {
      expect(screen.queryByText('Courses')).toBeInTheDocument();
      expect(screen.queryByText('CS-A1150')).toBeInTheDocument();
      expect(screen.queryByText('Programming 1')).toBeInTheDocument();
    });

  });

  test('AllCoursesView should render Create New Course for admin', async () => {

    const auth = { role: SystemRole.Admin };
    renderAllCoursesView(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).toBeInTheDocument());

  });

  test('AllCoursesView should not render Create New Course for non-admin users', async () => {

    const auth = { role: SystemRole.User };
    renderAllCoursesView(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).not.toBeInTheDocument());
  });

});
