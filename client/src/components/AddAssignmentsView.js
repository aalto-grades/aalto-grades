// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AssignmentCategory from './assignments/AssignmentCategory';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

const AddAssignmentsView = () => {
  let navigate = useNavigate();
  let { courseId, instanceId } = useParams();

  const { addedAttainments, setAddedAttainments } = useOutletContext();
  const [suggestedAttainments, setSuggestedAttainments] = useState([]);

  useEffect(() => {
    if (addedAttainments.length === 0) {
      setSuggestedAttainments(mockAttainmentsClient);
    } else {
      // if some attainments have been added, filter the suggestions to make sure there aren't duplicates
      // another possibility is to save the suggestions in context too, will consider if the retrieval is slow
      const allSuggested = mockAttainmentsClient;
      const nonAdded = allSuggested.filter(suggested => !addedAttainments.some(added => added.id === suggested.id));
      setSuggestedAttainments(nonAdded);
    }
  }, []);

  const onAddClick = (attainment) => () => {
    const newSuggested = suggestedAttainments.filter(a => a.id !== attainment.id);
    setSuggestedAttainments(newSuggested);
    setAddedAttainments(addedAttainments.concat([attainment]));
  };

  const onGoBack = () => {
    navigate('/' + courseId + '/edit-instance/' + instanceId);
  };

  const onConfirmAttainments = () => {
    navigate('/' + courseId + '/instance-summary/' + instanceId);
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <Typography variant='h3' sx={{ mb: 4, textAlign: 'left', fontWeight: 'light' }}>Add Study Attainments</Typography>
      <Typography align='left' sx={{ ml: 1.5 }}>Suggested study attainments from previous instances</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'secondary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch' }}>
          { suggestedAttainments.map(attainment => {
            return (
              <AssignmentCategory 
                key={attainment.id} 
                attainment={attainment} 
                button={<Button onClick={onAddClick(attainment)}>Add</Button>} 
              />
            );}
          ) }
        </Box>
      </Box>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', mb: 5, mt: 1, display: 'inline-block' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography align='left' sx={{ ml: 1.5 }} >Create and add a new study attainment:</Typography>
          <Button variant='outlined' onClick={ () => navigate(`/${courseId}/create-attainment/${instanceId}`) }>Create attainment</Button>
        </Box>
      </Box>
      <Typography align='left' sx={{ ml: 1.5 }} >Added study attainments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        { addedAttainments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            { addedAttainments.map(attainment => {
              return (
                <AssignmentCategory 
                  key={attainment.id} 
                  attainment={attainment}  
                  button={<Button 
                    onClick={ () => navigate(`/${courseId}/edit-attainment/${instanceId}/${attainment.id}`) }>
                      Edit
                  </Button>}
                />
              );}
            ) }
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >
          You can also add study attainments after creating the instance
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => onGoBack()}>Go back</Button>
        <Button variant='contained' onClick={() => onConfirmAttainments()}>Confirm attainments</Button>
      </Box>
    </Box>
  );
};

export default AddAssignmentsView;