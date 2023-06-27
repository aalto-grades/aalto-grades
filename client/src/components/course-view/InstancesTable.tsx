// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import sortingServices from '../../services/sorting';
import textFormatServices from '../../services/textFormat';
import { CourseInstanceData } from 'aalto-grades-common/types';

interface Cell {
  id: string,
  label: string
}

const headCells: Array<Cell> = [
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

function InstancesTable(props: {
  data: Array<CourseInstanceData>,
  current: number,
  onClick: (instance: CourseInstanceData) => void
}): JSX.Element {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {
            headCells.map((headCell: Cell) => (
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
            ))
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          props.data
            .sort(
              (a: CourseInstanceData, b: CourseInstanceData): number => {
                return sortingServices.sortByDate(a.startDate, b.startDate);
              }
            )
            .slice()
            .map((instance: CourseInstanceData) => (
              <TableRow
                key={instance.id}
                hover={true}
                selected={props.current === instance.id}
                onClick={(): void => props.onClick(instance)}
              >
                <TableCell>
                  {textFormatServices.formatDateString(String(instance.startDate))}
                </TableCell>
                <TableCell>
                  {textFormatServices.formatDateString(String(instance.endDate))}
                </TableCell>
                <TableCell>
                  {textFormatServices.formatCourseType(instance.type)}
                </TableCell>
              </TableRow>
            ))
        }
      </TableBody>
    </Table>
  );
}

InstancesTable.propTypes = {
  data: PropTypes.array,
  current: PropTypes.number,
  onClick: PropTypes.func
};

export default InstancesTable;
