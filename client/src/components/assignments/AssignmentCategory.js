// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomAccordion from './Accordion';
import { AccordionDetails, AssignmentText } from './Accordion';
import textFormatServices from '../../services/textFormat';

// This component renders a "category" of assignments, e.g. all assignments that are exams
// TODO: replace the points with formulas
const AssignmentCategory = ({ categoryObject, button, width }) => {

  const { category, totalPoints, assignments } = categoryObject;
  const { description, points, expiryDate, subAssignments } = assignments[0]; //must be at least one

  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white', width: width }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pr: '21px', pb: '16px', pl: '21px' }}>
        <Typography sx={{ fontWeight: 'bold' }} align='left'>{category}</Typography>
        <Typography align='left' variant='body2'>{'Total points: ' + totalPoints}</Typography>
      </Box>
      { subAssignments 
        ? <CustomAccordion assignments={assignments} />
        : <AccordionDetails out={true}><AssignmentText name={description} points={points} /></AccordionDetails>
      }
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pl: '21px', pr: '6px', pt: '8px' }}>
        <Typography align='left' variant='caption'>{'Expiry date: ' + textFormatServices.formatDateToString(expiryDate)}</Typography>
        {button ?? <Box height='30.5px'></Box>}
      </Box>
    </Box>
  );
};

AssignmentCategory.propTypes = {
  categoryObject: PropTypes.object,
  category: PropTypes.string,
  totalPoints: PropTypes.number,
  assignments: PropTypes.array,
  button: PropTypes.element,
  width: PropTypes.string
};

export default AssignmentCategory;