// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FrontPage from '../components/FrontPage';
import AuthContext from '../context/authProvider';

describe('Tests for FrontPage component', () => {

  const renderFrontPage = (auth) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ auth }}>
          <FrontPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };
  
  test('FrontPage should render current courses and previous courses regardless of user role', () => {
    const auth = { role: null };
    renderFrontPage(auth);

    const currentCoursesHeading = screen.getByText('Your Current Courses');
    const previousCoursesHeading = screen.getByText('Inactive Courses');

    expect(currentCoursesHeading).toBeDefined();
    expect(previousCoursesHeading).toBeDefined();
    
  });

  test('FrontPage should not render Create New Course for teacher', () => {
    
    const auth = { role: 'TEACHER' };
    renderFrontPage(auth);
    expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
    
  });

  test('FrontPage should render Create New Course for admin', () => {
    
    const auth = { role: 'SYSADMIN' };
    renderFrontPage(auth);
    const currentCoursesHeading = screen.getByText('Create New Course');
    expect(currentCoursesHeading).toBeDefined();
    
  });

  test('FrontPage should not render Create New Course for students', () => {
    
    const auth = { role: 'STUDENT' };
    renderFrontPage(auth);
    expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
    
  });

});