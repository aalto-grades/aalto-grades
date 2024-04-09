// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingScale, Language} from '@common/types';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {http} from 'msw';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditCourseView from '../components/course-view/EditCourseView';
import {mockPostSuccess, server} from './mock-data/server';

describe('Tests for EditCourseView components', () => {
  function renderEditCourseView(): void {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/course/create']}>
          <Routes>
            <Route
              path="/course/:modification/:courseId?"
              element={<EditCourseView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test('EditCourseView should render all of the appropriate components', () => {
    renderEditCourseView();

    expect(screen.getByText('Create a New Course')).toBeDefined();
    expect(screen.getByLabelText('Course Code*')).toBeDefined();
    expect(screen.getByLabelText('Course Name in English*')).toBeDefined();
    expect(screen.getByLabelText('Course Name in Finnish*')).toBeDefined();
    expect(screen.getByLabelText('Course Name in Swedish*')).toBeDefined();
    expect(
      screen.getByLabelText('Organizing department in English*')
    ).toBeDefined();
    expect(
      screen.getByLabelText('Organizing department in Finnish*')
    ).toBeDefined();
    expect(
      screen.getByLabelText('Organizing department in Swedish*')
    ).toBeDefined();
    expect(
      screen.getByLabelText('Minimum Course Credits (ECTS)*')
    ).toBeDefined();
    expect(
      screen.getByLabelText('Maximum Course Credits (ECTS)*')
    ).toBeDefined();
    expect(screen.getByLabelText('Grading Scale*')).toBeInTheDocument();
    expect(screen.getByLabelText('Course language*')).toBeInTheDocument();
    expect(screen.getByLabelText('Teachers In Charge*')).toBeDefined();
    expect(screen.getByText('Add')).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
    expect(screen.getByText('Submit')).toBeDefined();
  });

  test('EditCourseView should allow an admin to create a course', async () => {
    renderEditCourseView();

    const addCourse = vi.fn();
    server.use(http.post('*/v1/courses', mockPostSuccess(addCourse, 1)));

    const testCode: string = 'Test code';
    const testNameEn: string = 'Test name';
    const testNameFi: string = 'Testi nimi';
    const testNameSv: string = 'Sama ruotsiksi';
    const testDepartmentEn: string = 'Test department';
    const testDepartmentFi: string = 'Laitos xxx';
    const testDepartmentSv: string = 'samma på svenska';
    const testTeacher: string = 'Elon.Musk@twitter.com';

    act(() => userEvent.type(screen.getByLabelText('Course Code*'), testCode));
    act(() =>
      userEvent.type(
        screen.getByLabelText('Course Name in English*'),
        testNameEn
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Course Name in Finnish*'),
        testNameFi
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Course Name in Swedish*'),
        testNameSv
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Organizing department in English*'),
        testDepartmentEn
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Organizing department in Finnish*'),
        testDepartmentFi
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Organizing department in Swedish*'),
        testDepartmentSv
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Minimum Course Credits (ECTS)*'),
        '3'
      )
    );
    act(() =>
      userEvent.type(
        screen.getByLabelText('Maximum Course Credits (ECTS)*'),
        '5'
      )
    );
    act(() =>
      userEvent.type(screen.getByLabelText('Teachers In Charge*'), testTeacher)
    );

    act(() => userEvent.click(screen.getByText('Add')));
    act(() => userEvent.click(screen.getByText('Submit')));

    await waitFor(() => {
      expect(addCourse).toHaveBeenCalledTimes(1);
      expect(addCourse).toHaveBeenCalledWith({
        courseCode: testCode,
        minCredits: 3,
        maxCredits: 5,
        gradingScale: GradingScale.Numerical,
        languageOfInstruction: Language.English,
        department: {
          fi: testDepartmentFi,
          sv: testDepartmentSv,
          en: testDepartmentEn,
        },
        name: {
          fi: testNameFi,
          sv: testNameSv,
          en: testNameEn,
        },
        teachersInCharge: [
          {
            email: testTeacher,
          },
        ],
      });
    });
  });
});
