// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AssignmentCategory from '../assignments/AssignmentCategory';


const Assignments = ({ assignments, formula, instance }) => {
  const navigate = useNavigate();
  
  return (
    <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: 1.5, display: 'inline-block' }}>
      <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Assignments</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography align='left' sx={{ ml: 1.5 }} >{'Grading Formula: ' + formula}</Typography>
        <Button onClick={() => navigate('/select-formula/' + instance.id) }>Edit formula</Button>
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        { assignments.map(group => {
          return (
            <AssignmentCategory 
              key={group.category} 
              categoryObject={group} 
              button={<Button>Edit</Button>} 
              width={'50vw'} 
            />
          );}
        ) }
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Button onClick={() => navigate('/create-assignment/' + instance.id) }>Add assignment</Button>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
          <Button variant='outlined'>Calculate final grades</Button>
          <Button variant='contained'>Add points</Button>
        </Box>
      </Box>
    </Box>
  );
};

Assignments.propTypes = {
  assignments: PropTypes.array,
  instance: PropTypes.object,
  formula: PropTypes.string
};

export default Assignments;