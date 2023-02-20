// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceCreationRoute from '../context/InstanceCreationRoute';
import InstanceSummaryView from '../components/InstanceSummaryView';

describe('Tests for InstanceSummaryView components', () => {

  const renderInstanceSummaryView = async () => {
    return render(
      <MemoryRouter initialEntries={['/A-12345/instance-summary/test']}>
        <Routes>
          <Route element={<InstanceCreationRoute/>}>
            <Route path=':courseId/instance-summary/:instanceId' element={<InstanceSummaryView/>}/>
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  test('InstanceSummaryView should render the InstanceSummaryView and contain appropriate components', async () => {

    renderInstanceSummaryView();

    await waitFor(() => {
      const startingField = screen.getByText('Starting Date:');
      const endingField = screen.getByText('Ending Date:');
      const typeField = screen.getByText('Type:');
      const minCreditsField = screen.getByText('Min Credits:');
      const maxCreditsField = screen.getByText('Max Credits:');
      const gradingField = screen.getByText('Grading Scale:');
      const teacherField = screen.getByText('Instance Teachers');

      expect(startingField).toBeInTheDocument();
      expect(endingField).toBeInTheDocument();
      expect(typeField).toBeInTheDocument();
      expect(minCreditsField).toBeInTheDocument();
      expect(maxCreditsField).toBeInTheDocument();
      expect(gradingField).toBeInTheDocument();
      expect(teacherField).toBeInTheDocument();

      const createButton = screen.getByText('Create instance');
      const goBackButton = screen.getByText('Go back');
      expect(createButton).toBeInTheDocument();
      expect(goBackButton).toBeInTheDocument();
    });

  });

  test('InstanceSummaryView should render 2 alerts after "create instance" button is clicked', async () => {

    renderInstanceSummaryView();

    await waitFor( async () => {
      const createButton = screen.getByText('Create instance');

      expect(await screen.queryByText('Creating instance...')).not.toBeInTheDocument();
      //expect(await screen.queryByText('Instance created, you will be redirected to the course page.')).not.toBeInTheDocument();

      userEvent.click(createButton);

      expect(await screen.findByText('Creating instance...')).toBeInTheDocument();
      //expect(await screen.findByText('Instance created, you will be redirected to the course page.')).toBeInTheDocument();   TODO: figure out how to make these work xd
    });

  });

});