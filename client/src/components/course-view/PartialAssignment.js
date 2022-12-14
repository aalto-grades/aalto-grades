import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


const PartialAssignment = ({courseInstance}) => {
  const { type, description, points, weight } = courseInstance;

  return (
    <Box boxShadow={1} borderRadius={1} sx={{ pt: 1.5, pr: 1, pb: 1, pl: 3, width: '718px', bgcolor: 'white' }}>
      <Typography sx={{ fontWeight: 'bold', fontSize: '1.2em' }} align='left'>
        {type}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', mt: 1, mb: 1 }}>
        <Typography align='left' sx={{ width: '240px', pr: 5 }}>{description}</Typography>
        <Typography variant='body2' align='left' sx={{ width: '130px', pr: 9 }}>{'Total points: ' + points}</Typography>
        <Typography variant='body2'>{'Weight: ' + Math.round(weight * 100) + ' %'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography align='left' variant='caption'>Expiry date: 14.9.2024</Typography>
        <Button>
            Edit
        </Button>
      </Box>
    </Box>
  );
};


PartialAssignment.propTypes = {
  courseInstance: PropTypes.object,
  type: PropTypes.string,
  description: PropTypes.string, 
  points: PropTypes.number, 
  weight: PropTypes.number
};


export default PartialAssignment;