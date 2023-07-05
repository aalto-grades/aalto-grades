// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import instancesService from '../services/instances';
import { CourseInstanceData } from 'aalto-grades-common/types/course';
import { State } from '../types';

function EditInstanceView(): JSX.Element {
  const { sisuInstanceId }: Params = useParams();
  const [instance, setInstance]: State<CourseInstanceData> = useState();

  useEffect(() => {
    instancesService.getSisuInstance(sisuInstanceId)
      .then((courseInstance: CourseInstanceData) => {
        setInstance(courseInstance);
      })
      .catch((e) => console.log(e.message));
  }, []);

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
        Create Course Instance
      </Typography>
      {
        instance ?
          <>
            <Typography variant="h3" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
              {instance.courseData.courseCode + ' - ' + instance.courseData.name.en}
            </Typography>
            <EditInstanceForm instance={instance} />
          </>
          : <LinearProgress sx={{ margin: '200px 50px 0px 50px' }} />
      }
    </Container>
  );
}

export default EditInstanceView;
