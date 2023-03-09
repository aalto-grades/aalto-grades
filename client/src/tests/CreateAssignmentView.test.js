// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateAssignmentView from '../components/CreateAssignmentView';

describe('Tests for CreateAssignmentView components', () => {

  test('CreateAssignmentView should render all of the appropriate components', async () => {

    render(
      <BrowserRouter>
        <CreateAssignmentView />
      </BrowserRouter>
    );

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

  test('CreateAssignmentView should allow a teacher to create an assignment with a ready category', async () => {

    const logSpy = jest.spyOn(global.console, 'log');

    const testCategory = 'Exam';
    const testDate = '2023-09-01';
    const testExpiry = '2025-09-01';

    const mockAssignments = [{
      category: testCategory,
      name: testCategory,
      date: testDate,
      expiryDate: testExpiry,
      affectCalculation: false,
      formulaAttributes: [],
      subAssignments: [],
    }];

    render(
      <BrowserRouter>
        <CreateAssignmentView />
      </BrowserRouter>
    );

    const selectLabel = 'Name';
    const categoryField = await screen.findByLabelText(selectLabel);
    const dateField = screen.getByLabelText('Date');
    const expiryField = screen.getByLabelText('Expiry Date');
    const confirmButton = screen.getByText('Confirm');

    userEvent.click(categoryField);
    const optionsPopup = await screen.findByRole('listbox', { name: selectLabel });
    userEvent.click(within(optionsPopup).getByText(testCategory));

    expect(await screen.findByText(testCategory)).toBeInTheDocument();

    userEvent.type(dateField, testDate);
    userEvent.type(expiryField, testExpiry);
    userEvent.click(confirmButton);

    // Eventually test the function that adds an assignment to backend
    expect(logSpy).toHaveBeenCalledTimes(1); 
    expect(logSpy).toHaveBeenCalledWith(mockAssignments);

    logSpy.mockRestore();

  });

  test('CreateAssignmentView should allow a teacher to create an assignment with a new category', async () => {

    const logSpy = jest.spyOn(global.console, 'log');

    const testCategory = 'Other';
    const testName = 'Learning Diary';
    const testDate = '2023-09-01';
    const testExpiry = '2025-09-01';

    const mockAssignments = [{
      category: testCategory,
      name: testName,
      date: testDate,
      expiryDate: testExpiry,
      affectCalculation: false,
      formulaAttributes: [],
      subAssignments: [],
    }];

    render(
      <BrowserRouter>
        <CreateAssignmentView />
      </BrowserRouter>
    );

    const selectLabel = 'Name';
    const categoryField = await screen.findByLabelText(selectLabel);
    const dateField = screen.getByLabelText('Date');
    const expiryField = screen.getByLabelText('Expiry Date');
    const confirmButton = screen.getByText('Confirm');

    userEvent.click(categoryField);
    const optionsPopup = await screen.findByRole('listbox', { name: selectLabel });
    userEvent.click(within(optionsPopup).getByText(testCategory));

    expect(await screen.findByText(testCategory)).toBeInTheDocument();

    const nameField = screen.getByLabelText('New Name');
    userEvent.type(nameField, testName);
    userEvent.type(dateField, testDate);
    userEvent.type(expiryField, testExpiry);
    userEvent.click(confirmButton);

    // Eventually test the function that adds an assignment to backend
    expect(logSpy).toHaveBeenCalledTimes(1); 
    expect(logSpy).toHaveBeenCalledWith(mockAssignments);

    logSpy.mockRestore();
  });

  test('CreateAssignmentView should allow a teacher to create sub-assignments', async () => {

    const logSpy = jest.spyOn(global.console, 'log');

    const mockAssignments = [{
      category: '',
      name: '',
      date: '',
      expiryDate: '',
      affectCalculation: false,
      formulaAttributes: [],
      subAssignments: [{
        category: '',
        name: '',
        date: '',
        expiryDate: '',
        affectCalculation: false,
        formulaAttributes: [],
        subAssignments: [],
      }]
    }];

    render(
      <BrowserRouter>
        <CreateAssignmentView />
      </BrowserRouter>
    );

    const creationButton = screen.getByText('Create Sub-Attainments');
    expect(creationButton).toBeInTheDocument();

    // Create one sub-assignment
    userEvent.click(creationButton);

    const numberField = screen.getByLabelText('Number of sub-attainments');
    expect(numberField).toBeInTheDocument();

    const confirmButtons = await screen.findAllByText('Confirm');
    const numConfirmButton = confirmButtons[1]; // the second one aka the one in the dialog

    // the default number of sub-assignments in the Dialog element is 1 so this call creates one sub-assignment
    userEvent.click(numConfirmButton);

    // Check that there is one sub-assignment so one 'Cancel'-button
    const cancelButtons = await screen.findAllByText('Cancel');
    const addButton = screen.getByText('Add Sub-Attainments');

    expect(cancelButtons).toHaveLength(1);
    expect(addButton).toBeInTheDocument();

    userEvent.click(confirmButtons[0]);

    // Eventually test the function that adds an assignment to backend
    expect(logSpy).toHaveBeenCalledTimes(1); 
    expect(logSpy).toHaveBeenCalledWith(mockAssignments);

    logSpy.mockRestore();
  });

});
