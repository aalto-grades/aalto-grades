// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useParams, useViewTransitionState} from 'react-router-dom';

import Delayed from '@/components/shared/Delay';
import {GradesTableProvider} from '@/context/GradesTableProvider';
import {useGetGrades} from '@/hooks/useApi';
import GradesTable from './course-results-view/GradesTable';
import GradesTableToolbar from './course-results-view/GradesTableToolbar';

const GradesView = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const isTransitioning = useViewTransitionState('');
  const gradesQuery = useGetGrades(courseId);

  return (
    <Box textAlign="left" alignItems="left">
      <Typography width="fit-content" variant="h2">
        Grades
      </Typography>

      {gradesQuery.data !== undefined && !isTransitioning && (
        <Delayed>
          <GradesTableProvider data={gradesQuery.data}>
            <GradesTableToolbar />
            <GradesTable />
          </GradesTableProvider>
        </Delayed>
      )}
    </Box>
  );
};

export default GradesView;
