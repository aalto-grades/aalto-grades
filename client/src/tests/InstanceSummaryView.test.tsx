// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceSummaryView from '../components/InstanceSummaryView';
import instancesService from '../services/instances';
import attainmentServices from '../services/attainments';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

jest.mock('../services/instances');
jest.spyOn(attainmentServices, 'addAttainment');
afterEach(cleanup);

const mockContextWithoutAttainments = {
  addedAttainments: [],
  courseType: undefined,
  startDate: '2023-05-06',
  endDate: '2024-05-06',
  teachers: [],
  stringMinCredits: undefined,
  stringMaxCredits: undefined,
  gradingScale: undefined,
  startingPeriod: undefined,
  endingPeriod: undefined
};

const mockContextWithAttainments = {
  addedAttainments: [
    {
      ...mockAttainmentsClient[2],
      temporaryId: 1,
      date: '01 Jan 1970 00:00:00 GMT',
      expiryDate: '01 Jan 1971 00:00:00 GMT'
    }
  ],
  courseType: undefined,
  startDate: '2023-05-06',
  endDate: '2024-05-06',
  teachers: [],
  stringMinCredits: undefined,
  stringMaxCredits: undefined,
  gradingScale: undefined,
  startingPeriod: undefined,
  endingPeriod: undefined
};

describe(
  'Test InstanceSummaryView components when no attainments and successfull instance creation',
  () => {

    function renderInstanceSummaryView() {

      const mockResponseInstanceCreation = 22;

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
          const startingField = screen.getByText('Starting Date:');
          const endingField = screen.getByText('Ending Date:');
          const typeField = screen.getByText('Type:');
          const minCreditsField = screen.getByText('Min Credits:');
          const maxCreditsField = screen.getByText('Max Credits:');
          const gradingField = screen.getByText('Grading Scale:');
          const teacherField = screen.getByText('Teachers in Charge');

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

      }
    );

    test(
      'InstanceSummaryView should render 1 success alert after'
      + ' "create instance" button is clicked if response okay',
      async () => {

        const { getByText, findByText } = renderInstanceSummaryView();

        const createButton = getByText('Create instance');
        act(() => userEvent.click(createButton));

        expect(await findByText(
          'Instance created successfully. Redirecting to course page in 30 seconds.'
        )).toBeInTheDocument();
      }
    );

  }
);

describe(
  'Test InstanceSummaryView components when some attainments and successfull creations',
  () => {

    function renderInstanceSummaryView() {

      const mockResponseInstanceCreation = { courseInstance: { id: 22 } };

      (instancesService.createInstance as jest.Mock).mockResolvedValue(
        mockResponseInstanceCreation
      );

      (attainmentServices.addAttainment as jest.Mock).mockResolvedValue({
        success: true, data: {}
      });

      return render(
        <MemoryRouter initialEntries={['/A-12345/instance-summary/aalto-CUR-168938-2370795']}>
          <Routes>
            <Route element={<Outlet context={mockContextWithAttainments} />}>
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
      'InstanceSummaryView should render 2 success alerts after'
      + ' "create instance" button is clicked if responses okay',
      async () => {

        const { getByText, findByText } = renderInstanceSummaryView();

        const createButton = getByText('Create instance');
        act(() => userEvent.click(createButton));

        expect(await findByText('Instance created successfully.')).toBeInTheDocument();
        expect(await findByText(
          'Attainments added successfully. Redirecting to course page in 30 seconds.'
        )).toBeInTheDocument();
      }
    );

  }
);

describe(
  'Test InstanceSummaryView components when some attainments and successfull instance creation',
  () => {

    function renderInstanceSummaryView() {

      const mockResponseInstanceCreation = { courseInstance: { id: 22 } };
      (instancesService.createInstance as jest.Mock).mockResolvedValue(
        mockResponseInstanceCreation
      );

      (attainmentServices.addAttainment as jest.Mock).mockRejectedValue({});

      return render(
        <MemoryRouter initialEntries={['/A-12345/instance-summary/aalto-CUR-168938-2370795']}>
          <Routes>
            <Route element={<Outlet context={mockContextWithAttainments} />}>
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
      'InstanceSummaryView should render 2 alerts after "create instance"'
      + ' button is clicked when instance creation ok but attainments not',
      async () => {

        const { getByText, findByText } = renderInstanceSummaryView();

        const createButton = getByText('Create instance');
        act(() => userEvent.click(createButton));

        expect(await findByText('Instance created successfully.')).toBeInTheDocument();
        expect(await findByText(
          'Something went wrong while adding attainments.'
          + ' Redirecting to course page in 30 seconds.'
          + ' Attainments can be modified there.'
        )).toBeInTheDocument();
      }
    );

  }
);

describe(
  'Test InstanceSummaryView components when some attainments and error in instance creation',
  () => {

    function renderInstanceSummaryView() {

      (instancesService.createInstance as jest.Mock).mockRejectedValue(
        new Error('Internal server error')
      );

      return render(
        <MemoryRouter initialEntries={['/A-12345/instance-summary/aalto-CUR-168938-2370795']}>
          <Routes>
            <Route element={<Outlet context={mockContextWithAttainments} />}>
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
      'InstanceSummaryView should render 1 alert after "create instance"'
      + ' button is clicked when instance creation fails',
      async () => {

        const { getByText, findByText } = renderInstanceSummaryView();

        const createButton = getByText('Create instance');
        act(() => userEvent.click(createButton));

        expect(await findByText('Instance creation failed.')).toBeInTheDocument();
      }
    );

  }
);
