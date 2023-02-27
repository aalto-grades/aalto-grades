// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AssignmentCategory from './assignments/AssignmentCategory';
import mockAssignmentsClient from '../mock-data/mockAssignmentsClient';

const AddAssignmentsView = () => {
  let navigate = useNavigate();
  let { courseId, instanceId } = useParams();

  const { addedAssignments, setAddedAssignments } = useOutletContext();
  const [suggestedAssignments, setSuggestedAssignments] = useState([]);

  useEffect(() => {
    if (addedAssignments.length === 0) {
      setSuggestedAssignments(mockAssignmentsClient);
    } else {
      // if some assignments have been added, filter the suggestions to make sure there aren't duplicates
      // another possibility is to save the suggestions in context too, will consider if the retrieval is slow
      const allSuggested = mockAssignmentsClient;
      const nonAdded = allSuggested.filter(suggested => !addedAssignments.some(added => added.id === suggested.id));
      setSuggestedAssignments(nonAdded);
    }
  }, []);

  const onAddClick = (assignment) => () => {
    const newSuggested = suggestedAssignments.filter(a => a.id !== assignment.id);
    setSuggestedAssignments(newSuggested);
    setAddedAssignments(addedAssignments.concat([assignment]));
  };

  const onGoBack = () => {
    navigate('/' + courseId + '/edit-instance/' + instanceId);
  };

  const onConfirmAssignments = () => {
    navigate('/' + courseId + '/instance-summary/' + instanceId);
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <Typography variant='h3' sx={{ mb: 4, textAlign: 'left', fontWeight: 'light' }}>Add Assignments</Typography>
      <Typography align='left' sx={{ ml: 1.5 }}>Suggested assignments from previous instances</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'secondary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch' }}>
          { suggestedAssignments.map(assignment => {
            return (
              <AssignmentCategory 
                key={assignment.id} 
                assignment={assignment} 
                button={<Button onClick={onAddClick(assignment)}>Add</Button>} 
              />
            );}
          ) }
        </Box>
      </Box>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', mb: 5, mt: 1, display: 'inline-block' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography align='left' sx={{ ml: 1.5 }} >Create and add a new assignment:</Typography>
          <Button variant='outlined' onClick={ () => navigate('/create-assignment/1') }>Create assignment</Button>
        </Box>
      </Box>
      <Typography align='left' sx={{ ml: 1.5 }} >Added assignments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        { addedAssignments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            { addedAssignments.map(assignment => {
              return (
                <AssignmentCategory 
                  key={assignment.id} 
                  assignment={assignment}  
                  button={<Button onClick={ () => navigate('/edit-assignment/1/1') }>Edit</Button>}
                />
              );}
            ) }
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >You can also add assignments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => onGoBack()}>Go back</Button>
        <Button variant='contained' onClick={() => onConfirmAssignments()}>Confirm assignments</Button>
      </Box>
    </Box>
  );
};

export default AddAssignmentsView;