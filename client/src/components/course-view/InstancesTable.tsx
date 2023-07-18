// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import {
  Box, CircularProgress, Table, TableBody, TableCell,
  TableHead, TableRow, TableSortLabel, Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { JSX, useEffect, useState } from 'react';

//import { getInstances } from '../../services/instances';
import { compareDate } from '../../services/sorting';
import { convertToClientGradingScale, formatDateString } from '../../services/textFormat';
import { HeadCellData, State } from '../../types';

const headCells: Array<HeadCellData> = [
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

export default function InstancesTable(props: {
  courseId: string
}): JSX.Element {
  const [instances, setInstances]: State<Array<CourseInstanceData> | null> =
    useState<Array<CourseInstanceData> | null>(null);

  /*useEffect(() => {
    getInstances(props.courseId)
      .then((courseInstances: Array<CourseInstanceData>) => {
        const sortedInstances: Array<CourseInstanceData> = courseInstances.sort(
          (a: CourseInstanceData, b: CourseInstanceData) => {
            return compareDate(
              a.startDate as Date, b.startDate as Date
            );
          }
        );
        setInstances(sortedInstances);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);*/

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            {
              headCells.map((headCell: HeadCellData) => (
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
            instances &&
            instances
              .sort(
                (a: CourseInstanceData, b: CourseInstanceData): number => {
                  return compareDate(
                    a.startDate as Date, b.startDate as Date
                  );
                }
              )
              .slice()
              .map((instance: CourseInstanceData) => (
                <TableRow
                  key={instance.id}
                >
                  <TableCell>
                    {formatDateString(String(instance.startDate))}
                  </TableCell>
                  <TableCell>
                    {formatDateString(String(instance.endDate))}
                  </TableCell>
                  <TableCell>
                    {instance.startingPeriod}
                  </TableCell>
                  <TableCell>
                    {instance.endingPeriod}
                  </TableCell>
                  <TableCell>
                    {instance.type}
                  </TableCell>
                  <TableCell>
                    {convertToClientGradingScale(instance.gradingScale)}
                  </TableCell>
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
      <Box sx={{ py: 5 }}>
        {
          instances?.length === 0 &&
          <Typography variant='h3'>
            No instances found for course, please create a new instance.
          </Typography>
        }
        {instances === null &&
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
