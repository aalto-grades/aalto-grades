// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import FetchedInstances from './fetch-instances-view/FetchedInstances';
import dummyInstances from '../dummy-data/dummyInstances';

// TODO: connect to backend and get actual instances

const FetchInstancesView = () => {
  return(
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Instances Found from SISU
        </Typography>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Select the instance you wish to add 
        </Typography>
        <FetchedInstances info={dummyInstances} />
        <Divider sx={{ my: 5 }}/>
      </Container>
      <Button size='medium' variant='outlined'>
        Start from Scratch
      </Button>
    </>
  );
};

export default FetchInstancesView;
