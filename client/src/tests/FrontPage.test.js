// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FrontPage from '../components/FrontPage';
import AuthContext from '../context/authProvider';
import coursesService from '../services/courses';

jest.mock('../services/courses');
afterEach(cleanup);

describe('Tests for FrontPage component', () => {

  const renderFrontPage = async (auth) => {

    const mockResponse = {
      courses: {
        current: [{
          id: 5,
          courseCode:'CS-A1150',
          department: {
            en: 'Department of Computer Science'
          }, 
          name: {
            en: 'Databases'
          },
        }],
        previous: [{
          id: 1,
          courseCode:'CS-A1110',
          department: {
            en: 'Department of Computer Science'
          }, 
          name: {
            en: 'Programming 1'
          },
        }]
      }

    };

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

  test('FrontPage should not render Create New Course for teacher', async () => {
  
    const auth = { role: 'TEACHER' };
    renderFrontPage(auth);

    await waitFor(() => expect(screen.queryByText('Create New Course')).not.toBeInTheDocument());
  });


  test('FrontPage should render Create New Course for admin', async () => {
    
    const auth = { role: 'SYSADMIN' };
    renderFrontPage(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).toBeInTheDocument());
    
  });

  test('FrontPage should not render Create New Course for students', async () => {
    
    const auth = { role: 'STUDENT' };
    renderFrontPage(auth);
    await waitFor(() => expect(screen.queryByText('Create New Course')).not.toBeInTheDocument());

  });

});