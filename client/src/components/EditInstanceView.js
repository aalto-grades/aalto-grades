// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import dummyInstances from '../dummy-data/dummyInstances';

// TODO: connect to backend and update actual instances

// Remove this when connection to backend is working
const getInstance = (instanceId) => {
  return dummyInstances.find( instance => instance.id === instanceId);
};

const EditInstanceView = () => {

  const instance = getInstance('mock-id-1');

  //let { instanceId } = useParams();
  /*const [instance, setInstance] = useState({});

  useEffect(() => {
    instancesService.getInstance(instanceId)
      .then((data) => setInstance(data.instance))
      .catch((e) => console.log(e.message));
  }, []);*/

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
