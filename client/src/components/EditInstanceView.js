// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import { useParams } from 'react-router-dom';
import dummyInstances from '../dummy-data/dummyInstances';

// TODO: connect to backend updtae actual instances

const getInstance = (instanceId) => {
  return dummyInstances.find( instance => instance.id === instanceId);
};

const EditInstanceView = () => {
  let { instanceId } = useParams();
  const instance = getInstance(instanceId);

  console.log(instance);

  return(
    <>
      <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
          Edit Basic Information
        </Typography>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
          {instance.courseData.courseCode + ' - ' + instance.courseData.name.en}
        </Typography>
        <EditInstanceForm instance={instance} />
      </Container>
    </>
  );
};

export default EditInstanceView;
