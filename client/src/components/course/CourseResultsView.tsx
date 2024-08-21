// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import {JSX} from 'react';
import {
  useParams,
  unstable_useViewTransitionState as useViewTransitionState,
} from 'react-router-dom';

import Delayed from '@/components/shared/Delay';
import {GradesTableProvider} from '@/context/GradesTableProvider';
import {useGetGrades} from '@/hooks/useApi';
import CourseResultsTable from './course-results-view/CourseResultsTable';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';

const CourseResultsView = (): JSX.Element => {
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
            <CourseResultsTableToolbar />
            <CourseResultsTable />
          </GradesTableProvider>
        </Delayed>
      )}
    </Box>
  );
};

export default CourseResultsView;
