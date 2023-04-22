// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAssignmentView from '../components/EditAssignmentView';
import assignmentServices from '../services/assignments';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

const courseId = 1;
const instanceId = 1;
const attainmentId = 2;  // Project

const mockDate = '2023-09-30T00:00:00.000Z';  // again had some problems with dates,
const mockExpiryDate = '2024-09-13T00:00:00.000Z';  // so I hardcoded them here

const getMockAttainment = () => {
  return JSON.parse(JSON.stringify(
    [mockAttainmentsClient.find((attainment) => attainment.id === attainmentId)]
  ));
};

assignmentServices.addAttainment = jest.fn();
assignmentServices.editAttainment = jest.fn();
afterEach(cleanup);

describe('Tests for EditAssignmentView components', () => {

  const renderEditAssignmentView = async () => {
    return render(
      <MemoryRouter initialEntries={[`/${courseId}/edit-attainment/${instanceId}/` + attainmentId]}>
        <Routes>
          <Route path='/:courseId/edit-attainment/:instanceId/:attainmentId' element={<EditAssignmentView/>}/>
        </Routes>
      </MemoryRouter>
    );
  };

  let mockAttainment = getMockAttainment()[0];  // object
  mockAttainment.temporaryId = mockAttainment.id;

  const mockContext = {
    addedAttainments: [mockAttainment],
    setAddedAttainments: jest.fn(),
    attainmentIncrementId: 0,
    setIncrementId: jest.fn(),
  };

  const renderTemporaryEditAssignmentView = async () => {

    return render(
      <MemoryRouter initialEntries={[`/${courseId}/edit-temporary-attainment/${instanceId}/` + attainmentId]}>
        <Routes>
          <Route element={<Outlet context={mockContext}/>}>
            <Route path='/:courseId/edit-temporary-attainment/:sisuInstanceId/:attainmentId' element={<EditAssignmentView/>}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  test('EditAssignmentView should render the appropriate amount of components', async () => {

    renderEditAssignmentView();

    await waitFor(async () => {
      const headingElement = screen.getByText('Edit Study Attainment');
      const categoryField = await screen.findAllByLabelText('Name');
      const confirmButton = screen.getByText('Confirm');

      let mockAttainment = getMockAttainment();  // array with one object
      const numOfAttainments = assignmentServices.getNumOfAttainments(mockAttainment);

      expect(headingElement).toBeInTheDocument();
      expect(categoryField).toHaveLength(numOfAttainments);
      expect(confirmButton).toBeInTheDocument();
    });
  });

  test('EditAssignmentView should only edit attainments if new ones are not created', async () => {

    // Mock request from client,
    // TODO: needs to be modified to match the final format used by the server.
    // Now the format is different since data isn't gotten from the server yet.
    let mockAttainment = getMockAttainment()[0];  // object
    mockAttainment.date = mockDate;
    mockAttainment.expiryDate = mockExpiryDate;

    renderEditAssignmentView();

    await waitFor(async () => {

      const dateField = screen.getByLabelText('Date');
      const expiryField = screen.getByLabelText('Expiry Date');

      userEvent.type(dateField, mockDate);
      userEvent.type(expiryField, mockExpiryDate);

      const confirmButton = screen.getByText('Confirm');
      userEvent.click(confirmButton);

      expect(assignmentServices.editAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), mockAttainment);
      expect(assignmentServices.addAttainment).not.toHaveBeenCalledWith(String(courseId), String(instanceId), mockAttainment);
    });

  });

  test('EditAssignmentView should edit and add attainments if also new attainments are created', async () => {

    const newAttainment = {
      name: '',
      date: null,
      expiryDate: mockExpiryDate,
      category: '',
      parentId: attainmentId,
      subAttainments: [],
      affectCalculation: false,
      formulaAttributes: {},
    };

    // Mock request from client,
    // TODO: needs to be modified to match the final format used by the server.
    // Now the format is different since data isn't gotten from the server yet.
    let mockAttainment = getMockAttainment()[0];  // object
    mockAttainment.date = mockDate;
    mockAttainment.expiryDate = mockExpiryDate;
    mockAttainment.subAttainments = [newAttainment];

    console.log(mockAttainment);

    renderEditAssignmentView();

    // Set the top attainment's dates
    const dateField = screen.getByLabelText('Date');
    const expiryField = screen.getByLabelText('Expiry Date');

    userEvent.type(dateField, mockDate);
    userEvent.type(expiryField, mockExpiryDate);

    // Create one sub-attainment:
    const creationButton = screen.getByText('Create Sub-Attainments');
    expect(creationButton).toBeInTheDocument();

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

    // Edit the original attainment and add one sub attainment to it
    userEvent.click(confirmButtons[0]);

    expect(assignmentServices.editAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), mockAttainment);
    expect(assignmentServices.addAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), newAttainment);

  });

  test('EditAssignmentView should render the appropriate amount of components during instance creation', async () => {

    renderTemporaryEditAssignmentView();

    await waitFor(async () => {
      const headingElement = screen.getByText('Edit Study Attainment');
      const categoryField = await screen.findAllByLabelText('Name');
      const confirmButton = screen.getByText('Confirm');

      let mockAttainment = getMockAttainment();  // array with one object
      const numOfAttainments = assignmentServices.getNumOfAttainments(mockAttainment);

      expect(headingElement).toBeInTheDocument();
      expect(categoryField).toHaveLength(numOfAttainments);
      expect(confirmButton).toBeInTheDocument();
    });

  });

  test('EditAssignmentView should update the context during instance creation', async () => {

    let mockAttainment = getMockAttainment()[0];  // object
    mockAttainment.temporaryId = mockAttainment.id;
    mockAttainment.date = mockDate.split('T')[0];
    mockAttainment.expiryDate = mockExpiryDate.split('T')[0];

    renderTemporaryEditAssignmentView();

    await waitFor(async () => {

      const dateField = screen.getByLabelText('Date');
      const expiryField = screen.getByLabelText('Expiry Date');

      userEvent.type(dateField, mockDate);
      userEvent.type(expiryField, mockExpiryDate);

      const confirmButton = screen.getByText('Confirm');
      userEvent.click(confirmButton);

      const updatedAttainments = assignmentServices.updateTemporaryAttainment(mockContext.addedAttainments, mockAttainment);

      expect(mockContext.setAddedAttainments).toHaveBeenCalledWith(updatedAttainments);

    });

  });

});
