// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import { Box, Button , Container, Divider, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';

import FetchedInstances from './fetch-instances-view/FetchedInstances';

import instanceServices from '../services/instances';
import { State } from '../types';

export default function FetchInstancesView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, courseCode }: Params = useParams();
  const [instances, setInstances]: State<Array<CourseInstanceData>> =
    useState<Array<CourseInstanceData>>([]);

  useEffect(() => {
    if (courseCode) {
      instanceServices.getSisuInstances(courseCode)
        .then((courseInstances: Array<CourseInstanceData>) => setInstances(courseInstances))
        .catch((e: Error) => console.log(e.message));
    }
  }, []);

  function onCancel(): void {
    navigate('/course-view/' + courseId);
  }

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
          Instances Found from Sisu
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Select the instance you wish to add
        </Typography>
        <FetchedInstances courseId={Number(courseId)} instances={instances} />
        <Divider sx={{ my: 5 }} />
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', pb: 6
        }}>
          <Button size='medium' variant='outlined' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size='medium'
            variant='outlined'
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
