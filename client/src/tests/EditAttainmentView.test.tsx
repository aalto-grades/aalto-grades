// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { rest } from 'msw';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { act, cleanup, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditAttainmentView from '../components/EditAttainmentView';

import { mockAttainments } from './mock-data/mockAttainments';
import { mockPostSuccess, mockSuccess, server } from './mock-data/server';

// Not mocking structuredClone leads to errors about it being undefined.
// Probably related: https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};

const editAttainment: jest.Mock = jest.fn();
const addAttainment: jest.Mock = jest.fn();
afterEach(cleanup);

describe('Tests for EditAttainmentView components', () => {

  function renderEditAttainmentView(): RenderResult {

    server.use(rest.post(
      '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
      mockPostSuccess(addAttainment, { attainment: mockAttainments })
    ));

    server.use(rest.put(
      '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
      mockPostSuccess(editAttainment, { attainment: mockAttainments })
    ));

    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={
          ['/1/attainment/edit/1/1']
        }>
          <Routes>
            <Route
              path='/:courseId/attainment/:modification/:assessmentModelId/:attainmentId'
              element={<EditAttainmentView />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  test('EditAttainmentView should render the appropriate amount of components', async () => {

    renderEditAttainmentView();

    await waitFor(async () => {
      const headingElement: HTMLElement = screen.getByText('Edit Study Attainment');
      const categoryField: Array<HTMLElement> = await screen.findAllByLabelText('Name');
      const confirmButton: HTMLElement = screen.getByText('Confirm');

      expect(headingElement).toBeInTheDocument();
      expect(categoryField).toHaveLength(1);
      expect(confirmButton).toBeInTheDocument();
    });
  });

  test('EditAttainmentView should only edit attainments if new ones are not created', async () => {

    renderEditAttainmentView();

    let daysValidField: HTMLElement;
    await waitFor(async () => {
      daysValidField = screen.getByLabelText('Days Valid');
    });

    act(() => userEvent.clear(daysValidField));
    act(() => userEvent.type(daysValidField, '42'));

    const confirmButton: HTMLElement = screen.getByText('Confirm');
    act(() => userEvent.click(confirmButton));

    await waitFor(() => {
      expect(editAttainment).toHaveBeenCalledTimes(15);
      expect(editAttainment).toHaveBeenCalledWith({
        ...mockAttainments,
        // TODO: Update daysValid as a number in attainment creation. Probably by
        // adding a number text field to also account for formula attributes.
        daysValid: '42'
      });
      expect(addAttainment).toHaveBeenCalledTimes(0);
    });

  });

  test(
    'EditAttainmentView should edit and add attainments if new attainments are created',
    async () => {

      renderEditAttainmentView();

      // Mock data, can be asserted as non-null safely.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mockAttainment: AttainmentData = mockAttainments.subAttainments![2];

      server.use(
        rest.get(
          '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
          mockSuccess({ attainment: mockAttainment })
        )
      );

      const newAttainment: AttainmentData = {
        id: -2,
        parentId: 3,
        name: '',
        tag: '',
        daysValid: 0,
      };

      // Create one sub-attainment:
      await waitFor(() => {
        const creationButton: HTMLElement = screen.getByText('Create Sub-Attainments');
        expect(creationButton).toBeInTheDocument();
      });

      act(() => userEvent.click(screen.getByText('Create Sub-Attainments')));

      const numberField: HTMLElement = screen.getByLabelText('Number of sub-attainments');
      expect(numberField).toBeInTheDocument();

      const confirmButtons: Array<HTMLElement> = await screen.findAllByText('Confirm');
      // the second one aka the one in the dialog
      const numConfirmButton: HTMLElement = confirmButtons[1];

      // the default number of sub-attainments in the Dialog element is 1
      // so this call creates one sub-attainment
      act(() => userEvent.click(numConfirmButton));

      // Check that there is one sub-attainment so one 'Delete'-button
      await waitFor(async () => {
        const deleteButtons: Array<HTMLElement> = await screen.findAllByText('Delete');
        const addButton: HTMLElement = screen.getByText('Add Sub-Attainments');

        expect(deleteButtons).toHaveLength(1);
        expect(addButton).toBeInTheDocument();
      });

      // Edit the original attainment and add one sub attainment to it
      act(() => userEvent.click(confirmButtons[0]));

      await waitFor(() => {
        expect(editAttainment).toHaveBeenCalledTimes(1);
        expect(editAttainment).toHaveBeenCalledWith({
          ...mockAttainment,
          subAttainments: [newAttainment]
        });
        expect(addAttainment).toHaveBeenCalledTimes(1);
        expect(addAttainment).toHaveBeenCalledWith(newAttainment);
      });
    }
  );
});
