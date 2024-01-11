// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, Formula, GradeType} from 'aalto-grades-common/types';
import {http} from 'msw';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {
  act,
  cleanup,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditAttainmentView from '../components/EditAttainmentView';

import {mockAttainments} from './mock-data/mockAttainments';
import {mockPostSuccess, mockSuccess, server} from './mock-data/server';

// Not mocking structuredClone leads to errors about it being undefined.
// Probably related: https://github.com/jsdom/jsdom/issues/3363
// 🐛
// global.structuredClone = <T,>(value: T): T => {
//   return JSON.parse(JSON.stringify(value));
// };

const editAttainment = vi.fn();
const addAttainment = vi.fn();
afterEach(cleanup);

describe('Tests for EditAttainmentView components', () => {
  function renderEditAttainmentView(): RenderResult {
    server.use(
      http.post(
        '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
        mockPostSuccess(addAttainment, mockAttainments)
      )
    );

    server.use(
      http.put(
        '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
        mockPostSuccess(editAttainment, mockAttainments)
      )
    );

    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/1/attainment/edit/1/1']}>
          <Routes>
            <Route
              path="/:courseId/attainment/:modification/:assessmentModelId/:attainmentId"
              element={<EditAttainmentView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test('EditAttainmentView should render the appropriate amount of components', async () => {
    renderEditAttainmentView();

    await waitFor(
      async () => {
        const headingElement: HTMLElement = screen.getByText(
          'Edit Study Attainment'
        );
        const categoryField: Array<HTMLElement> =
          await screen.findAllByLabelText('Name');
        const submitButton: HTMLElement = screen.getByText('Submit');

        expect(headingElement).toBeInTheDocument();
        expect(categoryField).toHaveLength(1);
        expect(submitButton).toBeInTheDocument();
      },
      {timeout: 10000}
    );
  });

  test('EditAttainmentView should only edit attainments if new ones are not created', async () => {
    renderEditAttainmentView();

    let daysValidField: HTMLElement;
    await waitFor(async () => {
      daysValidField = screen.getByLabelText('Days Valid');
    });

    act(() => userEvent.clear(daysValidField));
    act(() => userEvent.type(daysValidField, '42'));

    const submitButton: HTMLElement = screen.getByText('Submit');
    act(() => userEvent.click(submitButton));

    await waitFor(() => {
      expect(editAttainment).toHaveBeenCalledTimes(15);
      expect(editAttainment).toHaveBeenCalledWith({
        ...mockAttainments,
        daysValid: 42,
      });
      expect(addAttainment).toHaveBeenCalledTimes(0);
    });
  });

  test('EditAttainmentView should edit and add attainments if new attainments are created', async () => {
    // Mock data, can be asserted as non-null safely.
    const mockAttainment: AttainmentData = mockAttainments.subAttainments![2];

    server.use(
      http.get(
        '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
        mockSuccess(mockAttainment)
      )
    );

    renderEditAttainmentView();

    const newAttainment: AttainmentData = {
      id: -2,
      parentId: 3,
      name: '',
      daysValid: 0,
      minRequiredGrade: 1,
      maxGrade: 5,
      formula: Formula.Manual,
      formulaParams: {},
      gradeType: GradeType.Float,
    };

    // Create one sub-attainment:
    await waitFor(() => {
      const creationButton: HTMLElement = screen.getByText(
        'Create Sub-Attainments'
      );
      expect(creationButton).toBeInTheDocument();
    });

    act(() => userEvent.click(screen.getByText('Create Sub-Attainments')));

    const numberField: HTMLElement = screen.getByLabelText(
      'Number of sub-attainments'
    );
    expect(numberField).toBeInTheDocument();

    // Dialog button to confirm the amount of new sub-attainments.
    const confirmButton: HTMLElement = screen.getByText('Confirm');

    // the default number of sub-attainments in the Dialog element is 1.
    // This call creates one sub-attainment
    act(() => userEvent.click(confirmButton));

    // Check that there is one sub-attainment so one 'Delete'-button
    await waitFor(async () => {
      const deleteButtons: Array<HTMLElement> =
        await screen.findAllByText('Delete');
      const addButton: HTMLElement = screen.getByText('Add Sub-Attainments');

      expect(deleteButtons).toHaveLength(2);
      expect(addButton).toBeInTheDocument();
    });

    const submitButton: HTMLElement = screen.getByText('Submit');

    // Edit the original attainment and add one sub attainment to it
    act(() => userEvent.click(submitButton));

    await waitFor(() => {
      expect(editAttainment).toHaveBeenCalledTimes(1);
      expect(editAttainment).toHaveBeenCalledWith({
        ...mockAttainment,
        subAttainments: [newAttainment],
      });
      expect(addAttainment).toHaveBeenCalledTimes(1);
      expect(addAttainment).toHaveBeenCalledWith(newAttainment);
    });
  });
});
