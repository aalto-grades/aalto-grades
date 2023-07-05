// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX, useEffect, useState } from 'react';
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
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { State } from '../../types';
import instancesService from '../../services/instances';

interface Cell {
  id: string,
  label: string
}

const headCells: Array<Cell> = [
  {
    id: 'startDate',
    label: 'Starting Date'
  },
  {
    id: 'endingDate',
    label: 'Ending Date'
  },
  {
    id: 'startingPeriod',
    label: 'Starting Period'
  },
  {
    id: 'endingPeriod',
    label: 'Ending Period'
  },
  {
    id: 'type',
    label: 'Type'
  },
  {
    id: 'gradingScale',
    label: 'Grading Scale'
  }
];

function InstancesTable(props: {
  courseId: string
}): JSX.Element {
  const [instances, setInstances]: State<Array<CourseInstanceData> | null> = useState(null);

  useEffect(() => {
    instancesService.getInstances(props.courseId)
      .then((courseInstances: Array<CourseInstanceData>) => {
        const sortedInstances: Array<CourseInstanceData> = courseInstances.sort(
          (a: CourseInstanceData, b: CourseInstanceData) => {
            return sortingServices.sortByDate(a.startDate, b.startDate);
          }
        );
        setInstances(sortedInstances);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  return (
    <>
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
            instances && instances
              .sort(
                (a: CourseInstanceData, b: CourseInstanceData): number => {
                  return sortingServices.sortByDate(a.startDate, b.startDate);
                }
              )
              .slice()
              .map((instance: CourseInstanceData) => (
                <TableRow
                  key={instance.id}
                >
                  <TableCell>
                    {textFormatServices.formatDateString(String(instance.startDate))}
                  </TableCell>
                  <TableCell>
                    {textFormatServices.formatDateString(String(instance.endDate))}
                  </TableCell>
                  <TableCell>
                    {instance.startingPeriod}
                  </TableCell>
                  <TableCell>
                    {instance.endingPeriod}
                  </TableCell>
                  <TableCell>
                    {textFormatServices.formatCourseType(instance.type)}
                  </TableCell>
                  <TableCell>
                    {textFormatServices.convertToClientGradingScale(instance.gradingScale)}
                  </TableCell>
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
      <Box sx={{ py: 5 }}>
        { instances?.length === 0 &&
          <Typography variant='h3'>
            No instances found for course, please create a new instance.
          </Typography>
        }
        { instances === null &&
          <>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} variant='h3'>
              Loading course instances...
            </Typography>
          </>
        }
      </Box>
    </>
  );
}

InstancesTable.propTypes = {
  data: PropTypes.array
};

export default InstancesTable;
