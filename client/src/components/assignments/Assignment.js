import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CustomAccordion from './Accordion';
import Typography from '@mui/material/Typography';
import { AccordionDetails, AssignmentText } from './Accordion';
import textFormatServices from '../../services/textFormat';

const Assignment = ({ assignment, button }) => {
  const { type, name, points, weight, expiryDate, subAssignments } = assignment[0]; //must be at least one
  if(weight) console.log('fun');

  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white', width: '50vw' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pr: '21px', pb: '16px', pl: '21px' }}>
        <Typography sx={{ fontWeight: 'bold' }} align='left'>{type}</Typography>
        <Typography align='left' variant='body2'>{'Total points: ' + points}</Typography>
      </Box>
      { subAssignments 
        ? <CustomAccordion assignments={assignment} />
        : <AccordionDetails out={true}><AssignmentText name={name} points={points} /></AccordionDetails>
      }
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pl: '21px', pr: '6px', pt: '8px' }}>
        <Typography align='left' variant='caption'>{'Expiry date: ' + textFormatServices.formatDateToString(expiryDate)}</Typography>
        {button}
      </Box>
    </Box>
  );
};

Assignment.propTypes = {
  subAssignments: PropTypes.array,
  assignment: PropTypes.array,
  type: PropTypes.string,
  name: PropTypes.string, 
  points: PropTypes.number, 
  weight: PropTypes.number,
  button: PropTypes.element
};

export default Assignment;