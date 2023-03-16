// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

  test('EditAssignmentView should render the appropriate amount of components', async () => {

    renderEditAssignmentView();

    await waitFor(async () => {
      const headingElement = screen.getByText('Edit Study Attainment');
      const categoryField = await screen.findAllByLabelText('Name');
      const confirmButton = screen.getByText('Confirm');

      let mockAttainment = [mockAttainmentsClient.find((attainment) => attainment.id === attainmentId)];
      const numOfAttainments = assignmentServices.getNumOfAttainments(mockAttainment);

      expect(headingElement).toBeInTheDocument();
      expect(categoryField).toHaveLength(numOfAttainments);
      expect(confirmButton).toBeInTheDocument();
    });
  });

  test('EditAssignmentView should only edit attainments if new ones are not created', async () => {

    let mockAttainment = [mockAttainmentsClient.find((attainment) => attainment.id === attainmentId)][0];
    mockAttainment.date = mockDate;
    mockAttainment.expiryDate = mockExpiryDate;

    // Mock request from client,
    // TODO: needs to be modified to match the final format used by the server.
    // Now the format is different since data isn't gotten from the server yet.
    const request = {};
    Object.assign(request, mockAttainment)

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
      name: 'New attainment',
      date: mockDate,
      expiryDate: mockExpiryDate,
      category: 'Other',
      subAttainments: [],
      affectCalculation: false,
      formulaAttributes: [],
    }

    let mockAttainment = [mockAttainmentsClient.find((attainment) => attainment.id === attainmentId)][0];
    mockAttainment.date = mockDate;
    mockAttainment.expiryDate = mockExpiryDate;
    mockAttainment.subAttainments = [newAttainment];

    // Mock request from client,
    // TODO: needs to be modified to match the final format used by the server.
    // Now the format is different since data isn't gotten from the server yet.
    const request = {};
    Object.assign(request, mockAttainment)

    renderEditAssignmentView();

    await waitFor(async () => {

      const dateField = screen.getByLabelText('Date');
      const expiryField = screen.getByLabelText('Expiry Date');

      userEvent.type(dateField, mockDate);
      userEvent.type(expiryField, mockExpiryDate);

      const confirmButton = screen.getByText('Confirm');
      userEvent.click(confirmButton);

      expect(assignmentServices.editAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), mockAttainment);
      expect(assignmentServices.addAttainment).toHaveBeenCalledWith(String(courseId), String(instanceId), newAttainment);

    });

  });

});
