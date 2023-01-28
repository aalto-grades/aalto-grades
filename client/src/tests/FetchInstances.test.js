// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FetchedInstances from '../components/fetch-instances-view/FetchedInstances';
import dummyInstances from '../dummy-data/dummyInstances';
import FetchInstancesView from '../components/FetchInstancesView';

describe('Tests for FetchInstancesView components', () => {

  test('FetchInstancesView should contain all of the appropriate components', () => {
    
    render(
      <BrowserRouter>
        <FetchInstancesView/>
      </BrowserRouter>
    );

    const headingElement = screen.getByText('Instances Found from SISU');
    const subHeading = screen.getByText('Select the instance you wish to add');
    const scratchButton = screen.getByText('Start from Scratch');

    expect(headingElement).toBeDefined();
    expect(subHeading).toBeDefined();
    expect(scratchButton).toBeDefined();
  
  }),

  test('FetchedInstances should contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <FetchedInstances info={dummyInstances}/>
      </BrowserRouter>
    );

    const courseType = screen.getAllByText('Type:');
    const startDate = screen.getAllByText('Starting Date:');
    const endDate = screen.getAllByText('Ending Date:');

    expect(courseType).toBeDefined();
    expect(startDate).toBeDefined();
    expect(endDate).toBeDefined();

  });

});
