// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseResultsView from '../components/CourseResultsView';

describe('Tests for CourseResultsView components', () => {

  const renderCourseResultsView = async () => {
    return render(
      <BrowserRouter>
        <CourseResultsView />
      </BrowserRouter>
    );
  };

  test('CourseResultsTable should render the correct number of rows', async () => {

    renderCourseResultsView();

    await waitFor(() => {
      const headingElement = screen.queryByText('Course Results');
      const studentIdHeader = screen.queryByText('Student ID');
      const finalGradeHeader = screen.queryByText('Final Grade');
      const viewValidGradesText = screen.queryByText('View valid grades from past instances:');
      const viewAllGradesButton = screen.queryByText('View all grades');
      const calculateGradesButton = screen.queryByText('Calculate final grades');

      expect(headingElement).toBeInTheDocument();
      expect(studentIdHeader).toBeInTheDocument();
      expect(finalGradeHeader).toBeInTheDocument();
      expect(viewValidGradesText).toBeInTheDocument();
      expect(viewAllGradesButton).toBeInTheDocument();
      expect(calculateGradesButton).toBeInTheDocument();
    });
    
  });

  test('CourseResultsTable should render the correct number of rows', async () => {

    renderCourseResultsView();

    const studentRows = await screen.findAllByRole('row');
    expect(studentRows.length).toEqual(26); // 25 rows are displayed by default + 1 for header row

    // these students should be found on the first page
    const firstStudentListed = await screen.findByText('111235');
    expect(firstStudentListed).toBeInTheDocument();

    const lastStudentListed = await screen.findByText('288979');
    expect(lastStudentListed).toBeInTheDocument();
  });

  test('CourseResultsTable should search correctly based on student ID', async () => {

    renderCourseResultsView();

    const searchField = await screen.findByLabelText('Search by Student ID');

    expect(searchField).toBeInTheDocument();

    userEvent.type(searchField, '99');

    const lastStudentListed = await screen.findByText('997214');
    expect(lastStudentListed).toBeInTheDocument();
  });

  test('CourseResultsView should display an alert when grade calculation is started', async () => {

    renderCourseResultsView();

    await waitFor( async () => {
      expect(await screen.queryByText('Calculating final grades...')).not.toBeInTheDocument();

      const calculateGradesButton = screen.queryByText('Calculate final grades');
      userEvent.click(calculateGradesButton);

      expect(await screen.findByText('Calculating final grades...')).toBeInTheDocument();
    });
  });

});