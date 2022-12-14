import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

const headCells = [{
  id: 'period',
  label: 'Teaching Period',
},
{
  id: 'startDate',
  label: 'Starting Date',
},
{
  id: 'endingDate',
  label: 'Ending Date',
},
{
  id: 'type',
  label: 'Type',
}
];
  
const InstanceTableHead = () => {
  return (
    <TableRow>
      {headCells.map((headCell) => (
        headCell.id === 'period' ?
          <TableCell key={headCell.id}>
            <TableSortLabel active={headCell.id === 'period'} direction='asc'>
              <Typography sx={{ fontWeight: 'bold' }}>
                {headCell.label}
              </Typography>
            </TableSortLabel>
          </TableCell>
          :
          <TableCell key={headCell.id}>
            <Typography sx={{ fontWeight: 'bold' }}>
              {headCell.label}
            </Typography>
          </TableCell>
      ))}
    </TableRow>
  );
};

export default InstanceTableHead;