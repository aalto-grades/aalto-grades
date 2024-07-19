// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography, useTheme} from '@mui/material';
import {JSX} from 'react';
import {unstable_useViewTransitionState, useParams} from 'react-router-dom';

import CourseResultsTable from './course-results-view/CourseResultsTable';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';
import Delayed from './shared/Delay';
import {GradesTableProvider} from '../context/GradesTableProvider';
import {useGetGrades} from '../hooks/useApi';

const CourseResultsView = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const isTransitioning = unstable_useViewTransitionState('');
  const theme = useTheme();
  const gradesQuery = useGetGrades(courseId);

  return (
    <Box textAlign="left" alignItems="left">
      <Typography width={'fit-content'} variant="h2">
        Grades
      </Typography>

      {gradesQuery.data && !isTransitioning && (
        <Delayed>
          <GradesTableProvider data={gradesQuery.data}>
            <CourseResultsTableToolbar />
            <CourseResultsTable />
          </GradesTableProvider>
        </Delayed>
      )}
    </Box>
  );
};

export default CourseResultsView;
