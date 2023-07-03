// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Route, Routes, Outlet } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import {
  act, render, RenderResult, screen, waitFor, within, cleanup
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateAttainmentView from '../components/CreateAttainmentView';
import attainmentServices from '../services/attainments';
import mockAttainments from './mock-data/mockAttainments';
import { AttainmentData } from 'aalto-grades-common/types';

const mockAttainment: AttainmentData = mockAttainments[0];
const courseId: number = 1;
const assessmentModelId: number = mockAttainment.assessmentModelId;

// Not mocking structuredClone leads to errors about it being undefined.
// Probably related: https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};

attainmentServices.addAttainment = jest.fn();
afterEach(cleanup);

describe('Tests for CreateAttainmentView components', () => {

  async function renderCreateAttainmentView(): Promise<RenderResult> {

    return render(
      <MemoryRouter initialEntries={[`/${courseId}/create-attainment/${assessmentModelId}`]}>
        <Routes>
          <Route path='/:courseId/create-attainment/:assessmentModelId' element={<CreateAttainmentView/>}/>
        </Routes>
      </MemoryRouter>
    );
  }

  test('CreateAttainmentView should render all of the appropriate components', async () => {

    renderCreateAttainmentView();

    const headingElement = screen.getByText('Create Study Attainment');
    const nameField = screen.getByLabelText('Name');
    const tagField = screen.getByLabelText('Tag');
    const daysValidField = screen.getByLabelText('Days Valid');
    const creationButton = screen.getByText('Create Sub-Attainments');
    const confirmButton = screen.getByText('Confirm');

    expect(headingElement).toBeInTheDocument();
    expect(nameField).toBeInTheDocument();
    expect(tagField).toBeInTheDocument();
    expect(daysValidField).toBeInTheDocument();
    expect(creationButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  test(
    'CreateAttainmentView should allow a teacher to create an attainment',
    async () => {

      const mockName: string = 'THE name';
      const mockTag: string = 'THE tag';
      const mockDaysValid: string = '512';

      // Mock request from client
      const request: AttainmentData = {
        id: -1,
        parentId: null,
        name: mockName,
        tag: mockTag,
        // TODO: Update daysValid as a number in attainment creation. Probably by
        // adding a number text field to also account for formula attributes.
        daysValid: mockDaysValid, // ts-ignore
        subAttainments: [],
      };

      renderCreateAttainmentView();

      let nameField: HTMLElement;
      let tagField: HTMLElement;
      let daysValidField: HTMLElement;
      let confirmButton: HTMLElement;

      await waitFor(async () => {
        nameField = screen.getByLabelText('Name');
        tagField = screen.getByLabelText('Tag');
        daysValidField = screen.getByLabelText('Days Valid');
        confirmButton = screen.getByText('Confirm');
      });

      act(() => userEvent.type(nameField, mockName));
      act(() => userEvent.type(tagField, mockTag));
      act(() => userEvent.clear(daysValidField));
      act(() => userEvent.type(daysValidField, mockDaysValid));
      act(() => userEvent.click(confirmButton));

      expect(attainmentServices.addAttainment)
        .toHaveBeenCalledWith(String(courseId), String(assessmentModelId), request);
    }
  );

  test('CreateAttainmentView should allow a teacher to create sub-attainments', async () => {

    renderCreateAttainmentView();

    const creationButton = screen.getByText('Create Sub-Attainments');
    expect(creationButton).toBeInTheDocument();

    // Create one sub-attainment
    act(() => userEvent.click(creationButton));

    const numberField = screen.getByLabelText('Number of sub-attainments');
    expect(numberField).toBeInTheDocument();

    const confirmButtons = await screen.findAllByText('Confirm');
    const numConfirmButton = confirmButtons[1]; // the second one aka the one in the dialog

    // the default number of sub-attainments in the Dialog element is 1 so this
    // call creates one sub-attainment
    act(() => userEvent.click(numConfirmButton));

    // Check that there is one sub-attainment so one 'Delete'-button
    const deleteButtons = await screen.findAllByText('Delete');
    const addButton = screen.getByText('Add Sub-Attainments');

    expect(deleteButtons).toHaveLength(1);
    expect(addButton).toBeInTheDocument();
  });

});
