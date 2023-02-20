// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from './Assignment';


const Assignments = ({ assignments, instance }) => {
  const navigate = useNavigate();
  
  return (
    <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: 1.5, display: 'inline-block' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Assignments</Typography>
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        {assignments.map(assignment => <Assignment key={assignment.id} assignment={assignment} />)}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1 }}>
        <Button onClick={() => navigate('/create-assignment/' + instance.id) }>Add assignment</Button>
        <Box>
          <Button variant='outlined' sx={{ mr: 1 }}>Calculate final grades</Button>
          <Button variant='contained'>Add points</Button>
        </Box>
      </Box>
    </Box>
  );
};

Assignments.propTypes = {
  assignments: PropTypes.array,
  instance: PropTypes.object,
};

export default Assignments;