// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';

const headCells = [{
  id: 'code',
  label: 'Code',
},
{
  id: 'name',
  label: 'Name',
},
{
  id: 'department',
  label: 'Organizer',
},
];

// for now the TableSortLabel element is static and displayd only for the code column
// because the rows are sorted by the course code
function CourseHeadTableRow() {
  return (
    <TableRow>
      {headCells.map((headCell) => (
        headCell.id === 'code' ?
          <TableCell key={headCell.id}>
            <TableSortLabel active={headCell.id === 'code'} direction='asc'>
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

export default CourseHeadTableRow;
