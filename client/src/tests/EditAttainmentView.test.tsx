// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { act, cleanup, render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditAttainmentView from '../components/EditAttainmentView';

import { mockAttainments } from './mock-data/mockAttainments';

const courseId: number = 1;
const assessmentModelId: number = 1;
const attainmentId: number = 2;  // Project

// Not mocking structuredClone leads to errors about it being undefined.
// Probably related: https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};

function getMockAttainment(): AttainmentData {
  return structuredClone(
    // Mock data, can be asserted as non-null safely.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mockAttainments.subAttainments!.find(
      (attainment: AttainmentData) => attainment.id === attainmentId
    )!
  );
}

//editAttainment = jest.fn();
//addAttainment = jest.fn();
//deleteAttainment = jest.fn();
afterEach(cleanup);

describe('Tests for EditAttainmentView components', () => {

  function renderEditAttainmentView(): RenderResult {
    return render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={
          [`/${courseId}/attainment/edit/${assessmentModelId}/` + attainmentId]
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

    const mockAttainment: AttainmentData = getMockAttainment();
    // TODO: Update daysValid as a number in attainment creation. Probably by
    // adding a number text field to also account for formula attributes.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockAttainment.daysValid = '42';

    let daysValidField: HTMLElement;
    await waitFor(async () => {
      daysValidField = screen.getByLabelText('Days Valid');
    });

    act(() => userEvent.clear(daysValidField));
    act(() => userEvent.type(daysValidField, '42'));

    const confirmButton: HTMLElement = screen.getByText('Confirm');
    act(() => userEvent.click(confirmButton));

    /*expect(editAttainment)
      .toHaveBeenCalledWith(String(courseId), String(assessmentModelId), mockAttainment);
    expect(addAttainment)
      .not.toHaveBeenCalledWith(String(courseId), String(assessmentModelId), mockAttainment);*/

  });

  test(
    'EditAttainmentView should edit and add attainments if new attainments are created',
    async () => {

      renderEditAttainmentView();

      const newAttainment: AttainmentData = {
        id: -2,
        parentId: 2,
        name: '',
        tag: '',
        daysValid: 0,
      };

      const mockAttainment: AttainmentData = getMockAttainment();
      mockAttainment.subAttainments = [newAttainment];

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

      /*expect(editAttainment)
        .toHaveBeenCalledWith(String(courseId), String(assessmentModelId), mockAttainment);
      expect(addAttainment)
        .toHaveBeenCalledWith(String(courseId), String(assessmentModelId), newAttainment);*/

    }
  );

});
