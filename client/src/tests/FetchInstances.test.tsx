// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult, screen, waitFor, cleanup } from '@testing-library/react';
import FetchInstancesView from '../components/FetchInstancesView';
import instanceServices from '../services/instances';
import mockSisuInstances from './mock-data/mockSisuInstances';

afterEach(cleanup);

describe('Tests for FetchInstancesView components', () => {

  const instancesLength: number = mockSisuInstances.length;

  function renderFetchInstancesView(): RenderResult {

    jest.spyOn(instanceServices, 'getSisuInstances').mockResolvedValue(mockSisuInstances);

    return render(
      <BrowserRouter>
        <FetchInstancesView />
      </BrowserRouter>
    );
  }

  test('FetchInstancesView should contain all of the appropriate components', async () => {

    renderFetchInstancesView();

    await waitFor(() => {
      expect(screen.getByText('Instances Found from Sisu')).toBeInTheDocument();
      expect(screen.getByText('Select the instance you wish to add')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
      expect(screen.getAllByText('Type:')).toHaveLength(instancesLength);
      expect(screen.getAllByText('Starting Date:')).toHaveLength(instancesLength);
      expect(screen.getAllByText('Ending Date:')).toHaveLength(instancesLength);
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByText('06.02.2023')).toBeInTheDocument();
    });

  });

});
