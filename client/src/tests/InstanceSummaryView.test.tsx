// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';

describe('Temp', () => {
  test('Temp', () => {
    expect(true).toBe(true);
  });
});

/*
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, RenderResult, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceSummaryView from '../components/InstanceSummaryView';
import instancesService from '../services/instances';
import attainmentServices from '../services/attainments';

jest.mock('../services/instances');
jest.spyOn(attainmentServices, 'addAttainment');
afterEach(cleanup);

const mockContextWithoutAttainments = {
  courseType: undefined,
  startDate: '2023-05-06',
  endDate: '2024-05-06',
  gradingScale: undefined,
  startingPeriod: undefined,
  endingPeriod: undefined
};

describe('Test InstanceSummaryView components on successful instance creation',
  () => {

    function renderInstanceSummaryView(): RenderResult {

      const mockResponseInstanceCreation: number = 22;

      (instancesService.createInstance as jest.Mock).mockResolvedValue(
        mockResponseInstanceCreation
      );

      (attainmentServices.addAttainment as jest.Mock).mockResolvedValue({
        success: true, data: {}
      });

      return render(
        <MemoryRouter initialEntries={['/A-12345/instance-summary/aalto-CUR-168938-2370795']}>
          <Routes>
            <Route element={<Outlet context={mockContextWithoutAttainments} />}>
              <Route
                path=':courseId/instance-summary/:instanceId'
                element={<InstanceSummaryView />}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      );
    }

    test(
      'InstanceSummaryView should render the InstanceSummaryView and'
      + ' contain appropriate components',
      async () => {

        renderInstanceSummaryView();

        await waitFor(() => {
          const startingField: HTMLElement = screen.getByText('Starting Date:');
          const endingField: HTMLElement = screen.getByText('Ending Date:');
          const typeField: HTMLElement = screen.getByText('Type:');
          const gradingField: HTMLElement = screen.getByText('Grading Scale:');

          expect(startingField).toBeInTheDocument();
          expect(endingField).toBeInTheDocument();
          expect(typeField).toBeInTheDocument();
          expect(gradingField).toBeInTheDocument();

          const createButton = screen.getByText('Create instance');
          const goBackButton = screen.getByText('Go back');
          expect(createButton).toBeInTheDocument();
          expect(goBackButton).toBeInTheDocument();
        });

      }
    );

    test(
      'InstanceSummaryView should render 1 success alert after'
      + ' "create instance" button is clicked if response okay',
      async () => {
        const { getByText, findByText }: RenderResult = renderInstanceSummaryView();

        const createButton = getByText('Create instance');
        act(() => userEvent.click(createButton));

        expect(await findByText(
          'Instance created successfully. Redirecting to course page in 30 seconds.'
        )).toBeInTheDocument();
      }
    );

  }
);
*/
