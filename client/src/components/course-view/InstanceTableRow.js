import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import textFormatServices from '../../services/textFormat';

const InstanceTableRow = ({instance}) => {
  const { period, startDate, endDate, type, id } = instance;
    
  return(
    <TableRow
      key={id} 
      hover={true}
      onClick={() => {/* TODO: Add functionality to view old instances */ }}
    >
      <TableCell>{period}</TableCell>
      <TableCell>{textFormatServices.formatDate(startDate)}</TableCell>
      <TableCell>{textFormatServices.formatDate(endDate)}</TableCell>
      <TableCell>{type}</TableCell>
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