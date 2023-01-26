// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditInstanceForm from '../components/edit-instance-view/EditInstanceForm';
import dummyInstances from '../dummy-data/dummyInstances';

describe('Tests for EditInstanceView components', () => {

  test('EditInstanceView should render the EditInstanceForm and contain all of the appropriate components', () => {

    const instance = dummyInstances[0];

    render(
      <BrowserRouter>
        <EditInstanceForm instance={instance}/>
      </BrowserRouter>
    );

    const typeField = screen.getByLabelText('Type');
    const startingField = screen.getByLabelText('Starting Date');
    const endingField = screen.getByLabelText('Ending Date');
    const teacherField = screen.getAllByLabelText('Instance Teacher');
    const minCreditsField = screen.getByLabelText('Min Credits');
    const maxCreditsField = screen.getByLabelText('Max Credits');
    const gradingField = screen.getByLabelText('Grading Scale');
    const confirmButton = screen.getByText('Confirm Details');

    expect(typeField).toBeDefined();
    expect(startingField).toBeDefined();
    expect(endingField).toBeDefined();
    expect(teacherField).toBeDefined();
    expect(minCreditsField).toBeDefined();
    expect(maxCreditsField).toBeDefined();
    expect(endingField).toBeDefined();
    expect(gradingField).toBeDefined();
    expect(confirmButton).toBeDefined();
  });

});
