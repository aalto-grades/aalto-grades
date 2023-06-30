// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult, screen, waitFor, cleanup } from '@testing-library/react';
import FrontPage from '../components/FrontPage';
import coursesService from '../services/courses';
import AuthContext from '../context/AuthProvider';
import mockCourses from './mock-data/mockCourses';
import { LoginResult, SystemRole } from 'aalto-grades-common/types';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Test FrontPage with courses of user', () => {

  function renderFrontPage(auth: LoginResult): RenderResult {

    (coursesService.getAllCourses as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getAllCourses as jest.Mock).mockResolvedValue(mockCourses);

    (coursesService.getCoursesOfUser as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getCoursesOfUser as jest.Mock).mockResolvedValue(mockCourses);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <FrontPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  test('FrontPage should render user\'s courses and all courses',
    async () => {
      const auth: LoginResult = {
        id: 2,
        name: 'User',
        role: SystemRole.User
      };

      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.queryByText('Your Courses')).toBeInTheDocument();
        expect(screen.queryByText('Courses')).toBeInTheDocument();
      });
    }
  );

  test('FrontPage should render create new course button for admins',
    async () => {
      const auth: LoginResult = {
        id: 1,
        name: 'Admin',
        role: SystemRole.Admin
      };

      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.queryByText('Create New Course')).toBeInTheDocument();
      });
    }
  );

  test('FrontPage should not render create new course button for users',
    async () => {
      const auth: LoginResult = {
        id: 2,
        name: 'User',
        role: SystemRole.User
      };

      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
      });
    }
  );

});

describe('Test FrontPage without courses of user', () => {

  function renderFrontPage(auth: LoginResult): RenderResult {

    (coursesService.getAllCourses as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getAllCourses as jest.Mock).mockResolvedValue(mockCourses);

    (coursesService.getCoursesOfUser as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getCoursesOfUser as jest.Mock).mockResolvedValue([]);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <FrontPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  test(
    'FrontPage should render a message saying the user has no courses'
    + ' and a list of all courses',
    async () => {
      const auth: LoginResult = {
        id: 2,
        name: 'User',
        role: SystemRole.User
      };

      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.queryByText('Your Courses')).toBeInTheDocument();
        expect(screen.queryByText('You have no courses.')).toBeInTheDocument();
        expect(screen.queryByText('Courses')).toBeInTheDocument();
      });
    }
  );

});
