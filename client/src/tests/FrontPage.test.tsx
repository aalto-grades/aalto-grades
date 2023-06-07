// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import FrontPage from '../components/FrontPage';
import coursesService from '../services/courses';
import AuthContext from '../context/authProvider';
import mockCourses from '../mock-data/mockCourses';
import { SystemRole } from '../types/general';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Tests for FrontPage component', () => {

  const renderFrontPage = async (auth) => {

    const mockResponse = { courses: mockCourses };

    coursesService.getCourses.mockRejectedValue('Network error');
    coursesService.getCourses.mockResolvedValue(mockResponse);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <FrontPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('FrontPage should render current courses and previous courses regardless of user role', async () => {
    const auth = { role: null };
    renderFrontPage(auth);

    await waitFor(() => {
      expect(screen.queryByText('Your Current Courses')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Courses')).toBeInTheDocument();
      expect(screen.queryByText('See instances')).toBeInTheDocument();
      expect(screen.queryByText('CS-A1150 – Databases')).toBeInTheDocument();
      expect(screen.queryByText('Programming 1')).toBeInTheDocument();
    });

  });

  test('FrontPage should not render Create New Course for non admin', async () => {

    const auth = { role: SystemRole.User };
    renderFrontPage(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).not.toBeInTheDocument());
  });


  test('FrontPage should render Create New Course for admin', async () => {

    const auth = { role: SystemRole.Admin };
    renderFrontPage(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).toBeInTheDocument());

  });

});