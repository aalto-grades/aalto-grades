// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import { Box, Button , Container, Divider, Typography } from '@mui/material';
import { JSX } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import FetchedInstances from './fetch-instances-view/FetchedInstances';

import { useGetAllSisuInstances } from '../hooks/useApi';

export default function FetchInstancesView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, courseCode }: Params = useParams() as { courseId: string, courseCode: string };

  const sisuInstances: UseQueryResult<Array<CourseInstanceData>> =
    useGetAllSisuInstances(courseCode);

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
          Instances Found from Sisu
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Select the instance you wish to add
        </Typography>
        {
          (sisuInstances.data) && (
            <FetchedInstances
              courseId={Number(courseId)}
              instances={sisuInstances.data}
            />
          )
        }
        <Divider sx={{ my: 5 }} />
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', pb: 6
        }}>
          <Button
            size='medium'
            variant='outlined'
            onClick={(): void => navigate('/course-view/' + courseId)}
          >
            Cancel
          </Button>
          <Button
            size='medium'
            variant='contained'
            onClick={(): void => {
              navigate('/' + courseId + '/edit-instance');
            }}
          >
            Start from Scratch
          </Button>
        </Box>
      </Container>
    </>
  );
}
