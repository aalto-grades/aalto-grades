// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box} from '@mui/material';
import {JSX} from 'react';
import {useParams} from 'react-router-dom';

import CourseResultsTable from './course-results-view/CourseResultsTable';
import CourseResultsTableToolbar from './course-results-view/CourseResultsTableToolbar';
import {GradesTableProvider} from '../context/GradesTableProvider';
import {useGetGrades} from '../hooks/useApi';

export default function CourseResultsView(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};

  const gradesQuery = useGetGrades(courseId);

  return (
    <Box textAlign="left" alignItems="left">
      {gradesQuery.data && (
        <GradesTableProvider data={gradesQuery.data}>
          <CourseResultsTableToolbar />
          <CourseResultsTable />
        </GradesTableProvider>
      )}
    </Box>
  );
}
