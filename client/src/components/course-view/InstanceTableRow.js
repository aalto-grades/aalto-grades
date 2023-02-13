// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import textFormatServices from '../../services/textFormat';

const InstanceTableRow = ({ instance }) => {
  const { id, startDate, endDate, courseType } = instance;
    
  return(
    <TableRow
      key={id} 
      hover={true}
      onClick={() => { /* TODO: Add functionality to view old instances */ }}
    >
      <TableCell>{textFormatServices.formatDateToString(startDate)}</TableCell>
      <TableCell>{textFormatServices.formatDateToString(endDate)}</TableCell>
      <TableCell>{courseType}</TableCell>
    </TableRow>
  );
};
    
InstanceTableRow.propTypes = {
  instance: PropTypes.object,
  period: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  id: PropTypes.number
};

export default InstanceTableRow;