// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import FetchedInstances from './fetch-instances-view/FetchedInstances';
import instancesService from '../services/instances';

const FetchInstancesView = (): JSX.Element => {
  let navigate = useNavigate();
  let { courseId, courseCode } = useParams();
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    instancesService.getSisuInstances(courseCode)
      .then((data) => setInstances(data.courseInstances))
      .catch((e: Error) => console.log(e.message));
  }, []);

  const onCancel = (): void => {
    navigate('/course-view/' + courseId);
  };

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
          Instances Found from Sisu
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Select the instance you wish to add
        </Typography>
        <FetchedInstances courseId={courseId} info={instances} />
        <Divider sx={{ my: 5 }} />
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', pb: 6
        }}>
          <Button size='medium' variant='outlined' onClick={onCancel}>
            Cancel
          </Button>
          <Button size='medium' variant='outlined'>
            { /* TODO: Implement */}
            Start from Scratch
          </Button>
        </Box>
      </Container>

    </>
  );
};

export default FetchInstancesView;
