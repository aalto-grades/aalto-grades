// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from './assignments/Assignment';

const dummyAssignments = [{ type: 'Exercises', name: '4 mandatory exercises', points: 20, weight: 0.2, id: 1, expiryDate: new Date(2024, 8, 14), 
  subAssignments: [{ type: 'Exercises', name: 'Exercise 1', points: 5, weight: 0.2, id: 11 }, 
    { type: 'Exercises', name: 'Exercise 2', points: 5, weight: 0.2, id: 12 }, 
    { type: 'Exercises', name: 'Exercise 3', points: 5, weight: 0.2, id: 13, 
      subAssignments: [{ type: 'Exercises', name: 'Exercise 3.1', points: 5, weight: 0.2, id: 111 }, 
        { type: 'Exercises', name: 'Exercise 3.2', points: 5, weight: 0.2, id: 112 }] }, 
    { type: 'Exercises', name: 'Exercise 4', points: 5, weight: 0.2, id: 14 }] },
{ type: 'Exercises', name: '3 optional exercises', points: 20, weight: 0.2, id: 4, expiryDate: new Date(2024, 8, 14), 
  subAssignments: [{ type: 'Exercises', name: 'Exercise 5', points: 5, weight: 0.2, id: 15 }, 
    { type: 'Exercises', name: 'Exercise 6', points: 5, weight: 0.2, id: 16 }, 
    { type: 'Exercises', name: 'Exercise 7', points: 5, weight: 0.2, id: 17 },] },
{ type: 'Projects', name: '1 mandatory project', points: 30, weight: 0.20, id: 2, expiryDate: new Date(2024, 8, 14) },
{ type: 'Exams', name: '1 mandatory exam', points: 40, weight: 0.55, id: 3, expiryDate: new Date(2024, 8, 14) }];

const groupAssignments = (assignmentArray) => {
  const map = new Map();
  assignmentArray.forEach(assignment => {
    if (map.has(assignment.type)) {
      map.get(assignment.type).push(assignment);
    } else {
      map.set(assignment.type, [assignment]);
    }
  });

  return [...map.values()];
};

const AddAssignmentsView = () => {
  let navigate = useNavigate();
  let { instanceId } = useParams();

  const { addedAssignments, setAddedAssignments } = useOutletContext();
  const [suggestedAssignments, setSuggestedAssignments] = useState([]);

  useEffect(() => {
    if (addedAssignments.length === 0) {
      setSuggestedAssignments(groupAssignments(dummyAssignments));
    } else {
      const allSuggested = groupAssignments(dummyAssignments);
      const nonAdded = [];
      allSuggested.forEach(a => {
        const found = addedAssignments.some(b => (a.length === b.length && a[0].id === b[0].id)); 
        found ? '' : nonAdded.push(a);
      });
      setSuggestedAssignments(nonAdded);
    }
  }, []); // change to when assignments change? Although probs not gonna happen without a page reload anyway

  const onAddClick = (assignment) => () => {
    const newSuggested = [];
    suggestedAssignments.forEach(a => {
      if ( !(a.length === assignment.length && a[0].id === assignment[0].id) ) 
        newSuggested.push(a); 
    });
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
          {suggestedAssignments.map(assignment => <Assignment key={assignment[0].type} assignment={assignment} button={<Button onClick={onAddClick(assignment)}>Add</Button>} />)}
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
            {addedAssignments.map(assignment => <Assignment key={assignment[0].type} assignment={assignment} button={<Button>Edit</Button>} />)}
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >You can also add assignments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined'>Go back</Button>
        <Button variant='contained' onClick={() => onConfirmAssignments()}>Confirm assignments</Button>
      </Box>
    </Box>
  );
};

export default AddAssignmentsView;