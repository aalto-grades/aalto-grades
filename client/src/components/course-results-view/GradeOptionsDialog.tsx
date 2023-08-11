// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { GradeOption } from 'aalto-grades-common/types';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@mui/material';
import { JSX } from 'react';

export default function GradeOptionsDialog(props: {
  title: string,
  options: Array<GradeOption>,
  open: boolean,
  handleClose: () => void
}): JSX.Element {

  interface Cell {
    id: keyof GradeOption,
    label: string
  }

  const headCells: Array<Cell> = [
    {
      id: 'gradeId',
      label: 'Grade ID'
    },
    {
      // TODO: Show the name or email of the grader
      id: 'graderId',
      label: 'Grader ID'
    },
    {
      id: 'grade',
      label: 'Grade'
    },
    {
      id: 'status',
      label: 'Status'
    },
    {
      id: 'manual',
      label: 'Manual'
    },
    {
      id: 'date',
      label: 'Date'
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date'
    },
    {
      id: 'comment',
      label: 'Comment'
    }
  ];

  return (
    <Dialog
      open={props.open}
      transitionDuration={{ exit: 800 }}
      maxWidth='md'
    >
      <DialogTitle>
        {props.title}
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell: Cell) => (
                <TableCell key={cell.id}>
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.options.map((option: GradeOption) => (
              <TableRow key={option.gradeId}>
                {headCells.map((cell: Cell) => (
                  <TableCell key={cell.id} style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word'
                  }}>
                    <Typography variant='body2' sx={{ maxWidth: 100 }}>
                      {(option[cell.id] === null || option[cell.id] === undefined)
                        ? '-' : String(option[cell.id])}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 3 }}>
        <Button
          size='medium'
          variant='outlined'
          onClick={props.handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
