// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import {
  Box, CircularProgress, Table, TableBody, TableCell,
  TableHead, TableRow, TableSortLabel, Typography
} from '@mui/material';
import { JSX } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { useGetAllInstances } from '../../hooks/useApi';
import { HeadCellData } from '../../types';
import { compareDate } from '../../utils/sorting';
import { formatDateString } from '../../utils/textFormat';

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
  }
];

export default function InstancesTable(props: {
  courseId: string
}): JSX.Element {

  const instances: UseQueryResult<Array<CourseInstanceData>> =
    useGetAllInstances(props.courseId);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            {
              headCells.map((headCell: HeadCellData) => (
                (headCell.id === 'startDate') ? (
                  <TableCell key={headCell.id}>
                    <TableSortLabel active={headCell.id === 'startDate'} direction='asc'>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {headCell.label}
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                ) : (
                  <TableCell key={headCell.id}>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {headCell.label}
                    </Typography>
                  </TableCell>
                )
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            (instances.data) &&
            instances.data
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
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
      <Box sx={{ py: 5 }}>
        {
          (instances.data?.length === 0) && (
            <Typography variant='h3'>
              No instances found for course, please create a new instance.
            </Typography>
          )
        }
        {
          (instances.isLoading) && (
            <>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} variant='h3'>
                Loading course instances...
              </Typography>
            </>
          )
        }
      </Box>
    </>
  );
}
