// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  RenderResult,
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {wait} from '@testing-library/user-event/dist/utils';
import {http} from 'msw';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {GradingScale, Language} from '@common/types';
import EditCourseView from '../components/course-view/EditCourseView';
import {mockPostSuccess, server} from './mock-data/server';

describe('Tests for EditCourseView components', () => {
  const renderEditCourseView = (): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/1/edit']}>
          <Routes>
            <Route path=":courseId/edit" element={<EditCourseView />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

  test('EditCourseView should render all of the appropriate components', async () => {
    renderEditCourseView();
    await act(async () => await wait(200));

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
    expect(screen.getAllByText('Add')[0]).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });

  test('EditCourseView should allow an admin to create a course', async () => {
    renderEditCourseView();
    await act(async () => await wait(200));

    const addCourse = vi.fn();
    server.use(http.put('/v1/courses/1', mockPostSuccess(addCourse, {})));

    const testValues = {
      courseCode: {label: 'Course Code*', value: 'Test code'},
      nameFi: {label: 'Course Name in Finnish*', value: 'Testi nimi'},
      nameEn: {label: 'Course Name in English*', value: 'Test name'},
      nameSv: {label: 'Course Name in Swedish*', value: 'Sama ruotsiksi'},
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
        label: 'Minimum Course Credits (ECTS)*',
        value: 3,
      },
      maxCredits: {
        label: 'Maximum Course Credits (ECTS)*',
        value: 5,
      },
    };
    const testTeacher = 'new.teacher@aalto.fi';

    for (const {label, value} of Object.values(testValues)) {
      act(() => {
        userEvent.clear(screen.getByLabelText(label));
        userEvent.type(screen.getByLabelText(label), value.toString());
      });
    }

    act(() =>
      userEvent.type(screen.getByLabelText('Teachers In Charge*'), testTeacher)
    );
    act(() => userEvent.click(screen.getAllByText('Add')[0]));

    act(() => userEvent.click(screen.getByText('Save')));

    await waitFor(() => {
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
