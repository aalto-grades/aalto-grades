// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Assignment from './create-assignment/Assignment';
import assignmentServices from '../services/assignments';
import mockAssignmentsClient from '../mock-data/mockAssignmentsClient';

const EditAssignmentView = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  // TODO: replace with a function that gets the actual data from the server
  const [assignments, setAssignments] = useState(assignmentServices.getFinalAssignmentById(mockAssignmentsClient, Number(assignmentId)));
  
  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      console.log(assignments);
      // TODO: connect to backend and add assignments to DB,
      // Add possible attributes and delete unnecessary ones
    } catch (exception) {
      console.log(exception);
    }
  };

  const deleteAssignment = () => {
    // TODO: connect to backend and delete assignments from DB,
    navigate(-1);
  };

  const removeAssignment = (indices) => {
    const updatedAssignments = assignmentServices.removeAssignment(indices, assignments);
    setAssignments(updatedAssignments);
  };

  return(
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
            Edit Study Attainment
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
            <Assignment 
              indices={[0]}
              assignments={assignments} 
              setAssignments={setAssignments} 
              removeAssignment={removeAssignment}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
            <Button size='medium' variant='outlined' color='error' onClick={deleteAssignment} sx={{ ml: 2 }}>Delete Attainment</Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
              <Button size='medium' variant='outlined' onClick={ () => navigate(-1) }>Cancel</Button>
              <Button size='medium' variant='contained' type='submit' onClick={handleSubmit} sx={{ mr: 2 }}>Confirm</Button>
            </Box>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default EditAssignmentView;