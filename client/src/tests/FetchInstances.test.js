// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import FetchInstancesView from '../components/FetchInstancesView';
import instancesService from '../services/instances';
import mockSisuInstances from '../mock-data/mockSisuInstances';

jest.mock('../services/instances');
afterEach(cleanup);

describe('Tests for FetchInstancesView components', () => {

  const instancesLength = mockSisuInstances.length;

  const renderFetchInstancesView = async () => {

    const mockResponse = { instances: mockSisuInstances };

    instancesService.getSisuInstances.mockRejectedValue('Network error');
    instancesService.getSisuInstances.mockResolvedValue(mockResponse);

    return render(
      <BrowserRouter>
        <FetchInstancesView />
      </BrowserRouter>
    );
  };

  test('FetchInstancesView should contain all of the appropriate components', async () => {
    
    renderFetchInstancesView();

    await waitFor(() => {
      const headingElement = screen.queryByText('Instances Found from SISU');
      const subHeading = screen.queryByText('Select the instance you wish to add');
      const scratchButton = screen.queryByText('Start from Scratch');
      const type = screen.queryAllByText('Type:');
      const startDate = screen.queryAllByText('Starting Date:');
      const endDate = screen.queryAllByText('Ending Date:');
      const mockType = screen.queryByText('Lecture');
      const mockDate = screen.queryByText('06.02.2023');

      expect(headingElement).toBeInTheDocument();
      expect(subHeading).toBeInTheDocument();
      expect(scratchButton).toBeInTheDocument();
      expect(type).toHaveLength(instancesLength);
      expect(startDate).toHaveLength(instancesLength);
      expect(endDate).toHaveLength(instancesLength);
      expect(mockType).toBeInTheDocument();
      expect(mockDate).toBeInTheDocument();
    });
  
  });

});
