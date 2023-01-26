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
import sortingServices from '../services/sorting';

describe('Tests for FetchInstancesView components', () => {

  test('FetchInstancesView should render the FetchedInstances and contain all of the appropriate components', () => {

    render(
      <BrowserRouter>
        <FetchInstancesView>
          <FetchedInstances info={dummyInstances}/>
        </FetchInstancesView>
      </BrowserRouter>
    );

    const headingElement = screen.getByText('Instances Found from SISU');
    const subHeading = screen.getByText('Select the instance you wish to add');
    const courseType = screen.getAllByText('Type:');
    const startDate = screen.getAllByText('Starting Date:');
    const endDate = screen.getAllByText('Ending Date:');
    const scratchButton = screen.getByText('Start from Scratch');

    expect(headingElement).toBeDefined();
    expect(subHeading).toBeDefined();
    expect(courseType).toBeDefined();
    expect(startDate).toBeDefined();
    expect(endDate).toBeDefined();
    expect(scratchButton).toBeDefined();
  }),

  test('sortByDate should correcty arrange dates in a descending order', () => {
  
    const dates = [new Date(2019, 8, 9), new Date(2021, 8, 14), new Date(2019, 11, 8), 
      new Date(2020, 8, 8), new Date(2020, 11, 7), new Date(2021, 11, 13)];

    const correctlyOrderedDates = [new Date(2021, 11, 13), new Date(2021, 8, 14), new Date(2020, 11, 7),
      new Date(2020, 8, 8), new Date(2019, 11, 8), new Date(2019, 8, 9)];

    dates.sort((a, b) => sortingServices.sortByDate(a, b));
    
    expect(dates).toStrictEqual(correctlyOrderedDates);
  });

});
