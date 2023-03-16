// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateAssignmentView from '../components/CreateAssignmentView';
import assignmentServices from '../services/assignments';
import mockAttainmentsServer from '../mock-data/mockAttainmentsServer';

const mockAttainment = mockAttainmentsServer[0];
const courseId = mockAttainment.courseId;
const instanceId = mockAttainment.courseInstanceId;

const mockDate = '2023-04-25T00:00:00.000Z';  // again had some problems with dates,
const mockExpiryDate = '2025-04-25T00:00:00.000Z';  // so I hardcoded them here

assignmentServices.addAttainment = jest.fn();
afterEach(cleanup);

describe('Tests for CreateAssignmentView components', () => {

  const renderCreateAssignmentView = async () => {

    return render(
      <MemoryRouter initialEntries={[`/${courseId}/create-attainment/${instanceId}`]}>
        <Routes>
          <Route path='/:courseId/create-attainment/:instanceId' element={<CreateAssignmentView/>}/>
        </Routes>
      </MemoryRouter>
    );
  };

  test('CreateAssignmentView should render all of the appropriate components', async () => {

    renderCreateAssignmentView();

    const headingElement = screen.getByText('Create Study Attainment');
    const selectLabel = 'Name';
    const categoryField = await screen.findByLabelText(selectLabel);
    const dateField = screen.getByLabelText('Date');
    const expiryField = screen.getByLabelText('Expiry Date');
    const creationButton = screen.getByText('Create Sub-Attainments');
    const confirmButton = screen.getByText('Confirm');

    userEvent.click(categoryField);
    const optionsPopup = await screen.findByRole('listbox', { name: selectLabel });
    userEvent.click(within(optionsPopup).getByText('Other'));

    expect(await screen.findByText('Other')).toBeInTheDocument();

    const nameField = screen.getByLabelText('New Name');

    expect(headingElement).toBeInTheDocument();
    expect(categoryField).toBeInTheDocument();
    expect(nameField).toBeInTheDocument();
    expect(dateField).toBeInTheDocument();
    expect(expiryField).toBeInTheDocument();
    expect(creationButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  }),

  test('CreateAssignmentView should allow a teacher to create an attainment with a ready category', async () => {

    const mockName = mockAttainment.name;
    
    // Mock request from client
    const request = {
      name: mockName,
      date: new Date(mockDate),
      expiryDate: new Date(mockExpiryDate),
      subAttainments: [],
      affectCalculation: false,
      category: mockName,
      formulaAttributes: [],
    };

    renderCreateAssignmentView();

    await waitFor( async () => {

      const selectLabel = 'Name';
      const categoryField = await screen.findByLabelText(selectLabel);
      const dateField = screen.getByLabelText('Date');
      const expiryField = screen.getByLabelText('Expiry Date');
      const confirmButton = screen.getByText('Confirm');

      userEvent.click(categoryField);
      const optionsPopup = await screen.findByRole('listbox', { name: selectLabel });
      userEvent.click(within(optionsPopup).getByText(mockName));

      expect(await screen.findByText(mockName)).toBeInTheDocument();

      userEvent.type(dateField, mockDate);
      userEvent.type(expiryField, mockExpiryDate);
      userEvent.click(confirmButton);

      expect(assignmentServices.addAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), request);

    });
  });

  test('CreateAssignmentView should allow a teacher to create an attainment with a new category', async () => {

    const mockCategory = 'Other';
    const mockName = 'Learning Diary';

    // Mock request from client
    const request = {
      name: mockName,
      date: new Date(mockDate),
      expiryDate: new Date(mockExpiryDate),
      category: mockCategory,
      subAttainments: [],
      affectCalculation: false,
      formulaAttributes: [],
    };

    renderCreateAssignmentView();

    await waitFor( async () => {

      const selectLabel = 'Name';
      const categoryField = await screen.findByLabelText(selectLabel);
      const dateField = screen.getByLabelText('Date');
      const expiryField = screen.getByLabelText('Expiry Date');
      const confirmButton = screen.getByText('Confirm');

      userEvent.click(categoryField);
      const optionsPopup = await screen.findByRole('listbox', { name: selectLabel });
      userEvent.click(within(optionsPopup).getByText(mockCategory));

      expect(await screen.findByText(mockCategory)).toBeInTheDocument();

      const nameField = screen.getByLabelText('New Name');
      userEvent.type(nameField, mockName);
      userEvent.type(dateField, mockDate);
      userEvent.type(expiryField, mockExpiryDate);
      userEvent.click(confirmButton);

      expect(assignmentServices.addAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), request);

    });
  });

  test('CreateAssignmentView should allow a teacher to create sub-attainments', async () => {

    renderCreateAssignmentView();

    const creationButton = screen.getByText('Create Sub-Attainments');
      expect(creationButton).toBeInTheDocument();

      // Create one sub-attainment
      userEvent.click(creationButton);

      const numberField = screen.getByLabelText('Number of sub-attainments');
      expect(numberField).toBeInTheDocument();

      const confirmButtons = await screen.findAllByText('Confirm');
      const numConfirmButton = confirmButtons[1]; // the second one aka the one in the dialog

      // the default number of sub-attainments in the Dialog element is 1 so this call creates one sub-attainment
      userEvent.click(numConfirmButton);

      // Check that there is one sub-attainment so one 'Delete'-button
      const deleteButtons = await screen.findAllByText('Delete');
      const addButton = screen.getByText('Add Sub-Attainments');

      expect(deleteButtons).toHaveLength(1);
      expect(addButton).toBeInTheDocument();
  });

});
