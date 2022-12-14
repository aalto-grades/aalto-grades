import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PartialAssignment from './PartialAssignment';


const Assignments = ({ assignments }) => {
  return (
    <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: 1.5, display: 'inline-block' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Partial Assignments</Typography>
        <Button>Add assignment</Button>
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        {assignments.map(assignment => <PartialAssignment key={assignment.id} courseInstance={assignment} />)}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Button variant='outlined'>Calculate final grades</Button>
        <Button variant='contained'>Add points</Button>
      </Box>
    </Box>
  );
};

Assignments.propTypes = {
  assignments: PropTypes.array
};

export default Assignments;