// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomAccordion from './Accordion';
import textFormatServices from '../../services/textFormat';
import formulasService from '../../services/formulas';

// This component renders a "category" of attainments, e.g. all attainments that are exams
// TODO: replace the points with formulas
const AssignmentCategory = ({ attainment, button, width, attainmentKey }) => {

  const { name, formulaId, expiryDate, subAttainments } = attainment;
  const titlepb = subAttainments.length !== 0 ? '16px' : '0px';  // title padding-bottom
  const expiryDateString = attainmentKey === 'id' ?
    textFormatServices.formatDateToString(expiryDate) :
    textFormatServices.formatDateString(textFormatServices.formatDateToSlashString(expiryDate));

  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white', width: width }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pr: '21px', pb: titlepb, pl: '21px' }}>
        <Typography sx={{ fontWeight: 'bold' }} align='left'>{name}</Typography>
        { formulaId 
          && <Typography align='left' variant='body2'>{'Formula: ' + formulasService.getFormulaName(formulaId)}</Typography>
        }
      </Box>
      { subAttainments.length !== 0
        && <CustomAccordion attainments={subAttainments} attainmentKey={attainmentKey} />
      }
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pl: '21px', pr: '6px', pt: '8px' }}>
        <Typography align='left' variant='caption'>{'Expiry date: ' + expiryDateString}</Typography>
        {button ?? <Box height='30.5px'></Box>}
      </Box>
    </Box>
  );
};

AssignmentCategory.propTypes = {
  attainment: PropTypes.object,
  button: PropTypes.element,
  width: PropTypes.string,
  attainmentKey: PropTypes.string,
};

export default AssignmentCategory;