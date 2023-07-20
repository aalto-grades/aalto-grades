// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { rest } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateCourseView from '../components/CreateCourseView';
import { server } from './mock-data/server';

describe('Tests for CreateCourseView components', () => {

  function renderCreateCourseView(): void {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/create-course']}>
          <Routes>
            <Route path='/create-course' element={<CreateCourseView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test(
    'CreateCourseView should render all of the appropriate components',
    () => {

      renderCreateCourseView();

      expect(screen.getByText('Create a New Course')).toBeDefined();
      expect(screen.getByLabelText('Course Code*')).toBeDefined();
      expect(screen.getByLabelText('Course Name in English*')).toBeDefined();
      expect(screen.getByLabelText('Course Name in Finnish*')).toBeDefined();
      expect(screen.getByLabelText('Course Name in Swedish*')).toBeDefined();
      expect(screen.getByLabelText('Organizer in English*')).toBeDefined();
      expect(screen.getByLabelText('Organizer in Finnish*')).toBeDefined();
      expect(screen.getByLabelText('Organizer in Swedish*')).toBeDefined();
      expect(screen.getByLabelText('Minimum Course Credits (ECTS)*')).toBeDefined();
      expect(screen.getByLabelText('Maximum Course Credits (ECTS)*')).toBeDefined();
      expect(screen.getByLabelText('Teachers In Charge*')).toBeDefined();
      expect(screen.getByText('Add')).toBeDefined();
      expect(screen.getByText('Cancel')).toBeDefined();
      expect(screen.getByText('Create Course')).toBeDefined();
    }
  );

  test('CreateCourseForm should allow an admin to create a course', async () => {

    renderCreateCourseView();

    const addCourse: jest.Mock = jest.fn();
    server.use(rest.post('*/v1/courses', addCourse));

    const testCode: string = 'Test code';
    const testNameEn: string = 'Test name';
    const testNameFi: string = 'Testi nimi';
    const testNameSv: string = 'Sama ruotsiksi';
    const testDepartmentEn: string = 'Test department';
    const testDepartmentFi: string = 'Laitos xxx';
    const testDepartmentSv: string = 'samma på svenska';
    const testTeacher: string = 'Elon.Musk@twitter.com';

    act(() => userEvent.type(screen.getByLabelText('Course Code*'), testCode));
    act(() => userEvent.type(screen.getByLabelText('Course Name in English*'), testNameEn));
    act(() => userEvent.type(screen.getByLabelText('Course Name in Finnish*'), testNameFi));
    act(() => userEvent.type(screen.getByLabelText('Course Name in Swedish*'), testNameSv));
    act(() => userEvent.type(screen.getByLabelText('Organizer in English*'), testDepartmentEn));
    act(() => userEvent.type(screen.getByLabelText('Organizer in Finnish*'), testDepartmentFi));
    act(() => userEvent.type(screen.getByLabelText('Organizer in Swedish*'), testDepartmentSv));
    act(() => userEvent.type(screen.getByLabelText('Minimum Course Credits (ECTS)*'), '3'));
    act(() => userEvent.type(screen.getByLabelText('Maximum Course Credits (ECTS)*'), '5'));
    act(() => userEvent.type(screen.getByLabelText('Teachers In Charge*'), testTeacher));

    act(() => userEvent.click(screen.getByText('Add')));
    act(() => userEvent.click(screen.getByText('Create Course')));

    await waitFor(() => {
      expect(addCourse).toHaveBeenCalledTimes(1);
      expect(addCourse).toHaveBeenCalledWith({
        courseCode: testCode,
        minCredits: 3,
        maxCredits: 5,
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
            email: testTeacher
          }
        ]
      });
    });
  });

});
