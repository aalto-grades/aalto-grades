// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import FrontPage from '../components/FrontPage';
import coursesService from '../services/courses';
import AuthContext from '../context/AuthProvider';
import mockCourses from './mock-data/mockCourses';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Tests for FrontPage component', () => {

  async function renderFrontPage(auth) {

    const mockResponse = {
      current: [mockCourses[0]],
      previous: [mockCourses[1]]
    };

    (coursesService.getCoursesOfUser as jest.Mock).mockRejectedValue('Network error');
    (coursesService.getCoursesOfUser as jest.Mock).mockResolvedValue(mockResponse);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <FrontPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  test(
    'FrontPage should render current courses and previous courses regardless of user role',
    async () => {
      const auth = { role: null };
      renderFrontPage(auth);

      await waitFor(() => {
        expect(screen.queryByText('Your Current Courses')).toBeInTheDocument();
        expect(screen.queryByText('Inactive Courses')).toBeInTheDocument();
        expect(screen.queryByText('See instances')).toBeInTheDocument();
        expect(screen.queryByText('CS-A1150 – Databases')).toBeInTheDocument();
        expect(screen.queryByText('Programming 1')).toBeInTheDocument();
      });

    }
  );

});
