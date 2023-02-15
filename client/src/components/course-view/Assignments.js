// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from '../assignments/Assignment';

// Key used is the type of the first element in the array. 
// This should be replaced when figuring out how to make distinct "assignment types"
const Assignments = ({ assignments, formula }) => {
  return (
    <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: 1.5, display: 'inline-block' }}>
      <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Assignments</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography align='left' sx={{ ml: 1.5 }} >{'Grading Formula: ' + formula}</Typography>
        <Button>Edit formula</Button>
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        {assignments.map(assignment => <Assignment key={assignment[0].type} assignment={assignment} button={<Button>Edit</Button>} width={'50vw'} />)}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Button>Add assignment</Button>
        <Button variant='outlined'>Calculate final grades</Button>
        <Button variant='contained'>Add points</Button>
      </Box>
    </Box>
  );
};

Assignments.propTypes = {
  assignments: PropTypes.array,
  formula: PropTypes.string
};

export default Assignments;