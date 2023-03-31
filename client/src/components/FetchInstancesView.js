// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import FetchedInstances from './fetch-instances-view/FetchedInstances';
import instancesService from '../services/instances';

const FetchInstancesView = () => {
  let { courseId, courseCode } = useParams();
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    instancesService.getSisuInstances(courseCode)
      .then((data) => setInstances(data.courseInstances))
      .catch((e) => console.log(e.message));
  }, []);

  return(
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
          Instances Found from SISU
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Select the instance you wish to add 
        </Typography>
        <FetchedInstances courseId={courseId} info={instances} />
        <Divider sx={{ my: 5 }}/>
      </Container>
      <Button size='medium' variant='outlined'>
        Start from Scratch
      </Button>
    </>
  );
};

export default FetchInstancesView;
