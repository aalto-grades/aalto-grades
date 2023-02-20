// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import instancesService from '../services/instances';

// TODO: update actual instance/save basic information

const EditInstanceView = () => {
  let { instanceId } = useParams();
  const [instance, setInstance] = useState();

  useEffect(() => {
    instancesService.getSisuInstance(instanceId)
      .then((data) => {
        setInstance(data.courseInstance);
      })
      .catch((e) => console.log(e.message));
  }, []);

  return(
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
        Edit Basic Information
      </Typography>
      { instance ?
        <>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
            {instance.courseData.courseCode + ' - ' + instance.courseData.name.en}
          </Typography>
          <EditInstanceForm instance={instance} />
        </>
        : <LinearProgress sx={{ margin: '200px 50px 0px 50px' }}/>
      }
    </Container>
  );
};

export default EditInstanceView;
