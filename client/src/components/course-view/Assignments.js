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
import MenuButton from './MenuButton';

const Assignments = ({ attainments, formula, courseId, instance, handleAddPoints }) => {
  const navigate = useNavigate();

  const actionOptions = [
    { description: 'Upload a file', handleClick: handleAddPoints }, 
    { description: 'Import from A+', handleClick: () => {} }
  ];
  
  return (
    <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: 1.5, display: 'inline-block' }}>
      <Typography variant='h3' align='left' sx={{ ml: 1.5, mt: 0.6, mb: 1.5 }} >Study Attainments</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography align='left' sx={{ ml: 1.5 }} >{'Grading Formula: ' + formula}</Typography>
        <Button onClick={() => navigate(`/${courseId}/select-formula/${instance.id}`) }>Edit formula</Button>
        { /* The path above should be changes once courseId can be fetched from the path */ }
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        { attainments.map(attainment => {
          /* Since the attainments are displayed by the course view, they exist in the database
             and their actual ids can be used are keys of the attainment accoridon */
          return (
            <AssignmentCategory 
              key={attainment.id} 
              attainment={attainment} 
              attainmentKey={'id'}
              button={<Button onClick={ () => navigate(`/${courseId}/edit-attainment/${instance.id}/${attainment.id}`) }>Edit</Button>} 
              width={'50vw'} 
            />
          );}
        ) }
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Button onClick={() => navigate(`/${courseId}/create-attainment/${instance.id}`) }>Add attainment</Button>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
          <Button variant='outlined'>Calculate final grades</Button>
          <MenuButton label='Add points' options={actionOptions} />
        </Box>
      </Box>
    </Box>
  );
};

Assignments.propTypes = {
  attainments: PropTypes.array,
  instance: PropTypes.object,
  formula: PropTypes.string,
  handleAddPoints: PropTypes.func,
  courseId: PropTypes.string,
};

export default Assignments;