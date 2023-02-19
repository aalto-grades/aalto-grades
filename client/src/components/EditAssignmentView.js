// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState }  from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import assignmentServices from '../services/assignments';
import mockAssignments2 from '../mock-data/mockAssignments2';

const EditAssignmentView = () => {
  // The property 'category' must be specified for each assignment in order to populate the textfields correctly
  const [assignments, setAssignments] = useState(
    assignmentServices.constructTreeAssignmets(JSON.parse(JSON.stringify(mockAssignments2)))
  );

  console.log(assignments);
  console.log(setAssignments);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      console.log(assignments);
      // TODO: connect to backend and add assignmentes to DB,
      // Add possible attributes and delete unnecessary ones
    } catch (exception) {
      console.log(exception);
    }
  };

  return(
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
            Edit Assignment
        </Typography>
        <form>
          <Box sx={{ 
            bgcolor: 'primary.light',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            my: 2,
            pt: 3,
            pb: 1,
            px: 2,
          }}>
          </Box>
          <Button size='medium' variant='outlined' sx={{ mr: 1 }}>
                Cancel
          </Button>
          <Button size='medium' variant='contained' type='submit' onClick={handleSubmit} sx={{ mr: 2 }}>
                Confirm
          </Button>
        </form>
      </Container>
    </>
  );
};

export default EditAssignmentView;