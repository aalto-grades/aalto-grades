// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from './assignments/Assignment';
import mockSuggestedAssignments from '../mock-data/mockSuggestedAssignments';

const AddAssignmentsView = () => {
  let navigate = useNavigate();
  let { instanceId } = useParams();

  const { addedAssignments, setAddedAssignments } = useOutletContext();
  const [suggestedAssignments, setSuggestedAssignments] = useState([]);

  useEffect(() => {
    if (addedAssignments.length === 0) {
      setSuggestedAssignments(mockSuggestedAssignments);
    } else {
      const allSuggested = mockSuggestedAssignments;
      const nonAdded = allSuggested.filter(suggested => !addedAssignments.some(added => added.category === suggested.category));
      setSuggestedAssignments(nonAdded);
    }
  }, []); // change to when assignments change? Although probs not gonna happen without a page reload anyway

  const onAddClick = (assignment) => () => {
    const newSuggested = suggestedAssignments.filter(a => a.category !== assignment.category);
    setSuggestedAssignments(newSuggested);
    setAddedAssignments(addedAssignments.concat([assignment]));
  };

  const onConfirmAssignments = () => {
    navigate('/instance-summary/' + instanceId);
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <Typography variant='h3' sx={{ mb: 4, textAlign: 'left', fontWeight: 'light' }}>Add Assignments</Typography>
      <Typography align='left' sx={{ ml: 1.5 }}>Suggested assignments from previous instances</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'secondary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch' }}>
          {suggestedAssignments.map(assignment => <Assignment key={assignment.category} assignment={assignment} button={<Button onClick={onAddClick(assignment)}>Add</Button>} />)}
        </Box>
      </Box>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', mb: 5, mt: 1, display: 'inline-block' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography align='left' sx={{ ml: 1.5 }} >Create and add a new assignment:</Typography>
          <Button variant='outlined'>Create assignment</Button>
        </Box>
      </Box>
      <Typography align='left' sx={{ ml: 1.5 }} >Added assignments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        {addedAssignments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            {addedAssignments.map(assignment => <Assignment key={assignment.category} assignment={assignment} button={<Button>Edit</Button>} />)}
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >You can also add assignments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => { navigate('/edit-instance/' + instanceId); }}>Go back</Button>
        <Button variant='contained' onClick={() => onConfirmAssignments()}>Confirm assignments</Button>
      </Box>
    </Box>
  );
};

export default AddAssignmentsView;