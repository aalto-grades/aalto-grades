// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

const headCells = [{
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

function InstanceTableHead() {
  return (
    <TableRow>
      {headCells.map((headCell) => (
        headCell.id === 'startDate' ?
          <TableCell key={headCell.id}>
            <TableSortLabel active={headCell.id === 'startDate'} direction='asc'>
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
}

export default InstanceTableHead;
