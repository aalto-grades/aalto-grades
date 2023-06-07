// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import textFormatServices from '../../services/textFormat';

const InstanceTableRow = ({ instance, onClick, selected }) => {
  const { id, startDate, endDate, type } = instance;

  return(
    <TableRow
      key={id}
      hover={true}
      selected={selected}
      onClick={() => onClick(instance)}
    >
      <TableCell>{textFormatServices.formatDateString(startDate)}</TableCell>
      <TableCell>{textFormatServices.formatDateString(endDate)}</TableCell>
      <TableCell>{textFormatServices.formatCourseType(type)}</TableCell>
    </TableRow>
  );
};

InstanceTableRow.propTypes = {
  instance: PropTypes.object,
  period: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  id: PropTypes.number,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

export default InstanceTableRow;