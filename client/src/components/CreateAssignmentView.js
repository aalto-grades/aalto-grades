// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState }  from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Assignment from './create-assignment/Assignment';
import assignmentServices from '../services/assignments'; 

const CreateAssignmentView = () => {
  const navigate = useNavigate();
  let { courseId, instanceId } = useParams();
  const { addedAssignments, setAddedAssignments } = useOutletContext();

  console.log(addedAssignments);

  // The property 'category' must be specified for each assignment in order to populate the textfields correctly
  const [assignments, setAssignments] = useState([{
    category: '',
    name: '',
    date: '',
    expiryDate: '',
    affectCalculation: false,
    formulaAttributes: [],
    subAttainments: [],
  }]);

  const addAttainment = async (attainmentObject) => {
    try {
      const attainment = await assignmentServices.addAttainment(courseId, instanceId, attainmentObject);
      console.log(attainment);
      //navigate('/' + courseId, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      // If this view is opened from the course view, add to DB
      // Else the attainment is being created during the creation of an instance so only add to the context
      if (isNaN(instanceId)) {  // change to 'is defined' type clause
        setAddedAssignments(addedAssignments.concat(assignments));
        navigate(-1);
      } else {
        const updatedAssignments = assignmentServices.formatStringsToDates(assignments)[0];
        addAttainment(updatedAssignments);
      }
      // TODO: connect to backend and add assignmentes to DB,
      // Add possible attributes and delete unnecessary ones
    } catch (exception) {
      console.log(exception);
    }
  };

  const removeAssignment = (indices) => {
    const updatedAssignments = assignmentServices.removeAssignment(indices, assignments);
    setAssignments(updatedAssignments);
  };

  return(
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
            Create Study Attainment
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
            {/* Create the root assignment */}
            <Assignment 
              indices={[0]}
              assignments={assignments} 
              setAssignments={setAssignments} 
              removeAssignment={removeAssignment}
            />
          </Box>
          <Button size='medium' variant='outlined' onClick={ () => navigate(-1) } sx={{ mr: 1 }}>
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

export default CreateAssignmentView;
