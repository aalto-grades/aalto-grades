// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RenderResult, render, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {http} from 'msw';
import {RouterProvider, createMemoryRouter} from 'react-router-dom';

import {GradingScale, Language} from '@/common/types';
import {mockPostSuccess, server} from './mock-data/server';
import EditCourseView from '../components/course-view/EditCourseView';

describe('Tests for EditCourseView components', () => {
  const router = createMemoryRouter(
    [{path: '/:courseId/edit', element: <EditCourseView />}],
    {initialEntries: ['/1/edit']}
  );
  const renderEditCourseView = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

  test('EditCourseView should render all of the appropriate components', () => {
    renderEditCourseView();

    waitFor(() => {
      expect(screen.getByLabelText('Course code*')).toBeDefined();
      expect(screen.getByLabelText('Course name in English*')).toBeDefined();
      expect(screen.getByLabelText('Course name in Finnish*')).toBeDefined();
      expect(screen.getByLabelText('Course name in Swedish*')).toBeDefined();
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
        screen.getByLabelText('Minimum course credits (ECTS)*')
      ).toBeDefined();
      expect(
        screen.getByLabelText('Maximum course credits (ECTS)*')
      ).toBeDefined();
      expect(screen.getByLabelText('Grading scale*')).toBeInTheDocument();
      expect(screen.getByLabelText('Course language*')).toBeInTheDocument();
      expect(screen.getByLabelText('Teachers in charge*')).toBeDefined();
      expect(screen.getAllByText('Add')[0]).toBeDefined();
      expect(screen.getByText('Save')).toBeDefined();
    });
  });

  test('EditCourseView should allow an admin to create a course', () => {
    renderEditCourseView();

    const addCourse = vi.fn();
    server.use(http.put('/v1/courses/1', mockPostSuccess(addCourse, {})));

    const testValues = {
      courseCode: {label: 'Course code*', value: 'Test code'},
      nameFi: {label: 'Course name in Finnish*', value: 'Testi nimi'},
      nameEn: {label: 'Course name in English*', value: 'Test name'},
      nameSv: {label: 'Course name in Swedish*', value: 'Sama ruotsiksi'},
      departmentFi: {
        label: 'Organizing department in Finnish*',
        value: 'Laitos xxx',
      },
      departmentEn: {
        label: 'Organizing department in English*',
        value: 'Test department',
      },
      departmentSv: {
        label: 'Organizing department in Swedish*',
        value: 'samma på svenska',
      },
      minCredits: {
        label: 'Minimum course credits (ECTS)*',
        value: 3,
      },
      maxCredits: {
        label: 'Maximum course credits (ECTS)*',
        value: 5,
      },
    };
    const testTeacher = 'new.teacher@aalto.fi';

    waitFor(async () => {
      for (const {label, value} of Object.values(testValues)) {
        await userEvent.clear(screen.getByLabelText(label));
        await userEvent.type(screen.getByLabelText(label), value.toString());
      }

      await userEvent.type(
        screen.getByLabelText('Teachers in charge*'),
        testTeacher
      );
      await userEvent.click(screen.getAllByText('Add')[0]);

      await userEvent.click(screen.getByText('Save'));

      expect(addCourse).toHaveBeenCalledTimes(1);
      expect(addCourse).toHaveBeenCalledWith({
        courseCode: testValues.courseCode.value,
        minCredits: testValues.minCredits.value,
        maxCredits: testValues.maxCredits.value,
        gradingScale: GradingScale.Numerical,
        languageOfInstruction: Language.English,
        department: {
          fi: testValues.departmentFi.value,
          en: testValues.departmentEn.value,
          sv: testValues.departmentSv.value,
        },
        name: {
          fi: testValues.nameFi.value,
          en: testValues.nameEn.value,
          sv: testValues.nameSv.value,
        },
        teachersInCharge: ['teacher@aalto.fi', testTeacher],
        assistants: [],
      });
    });
  });
});
