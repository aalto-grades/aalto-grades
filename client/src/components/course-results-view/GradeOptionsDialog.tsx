// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradeOption} from '@common/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import {JSX} from 'react';

import {findBestGradeOption, isGradeDateExpired} from '../../utils';

export default function GradeOptionsDialog(props: {
  title: string;
  options: Array<GradeOption>;
  open: boolean;
  handleClose: () => void;
}): JSX.Element {
  const theme: Theme = useTheme();
  interface Cell {
    id: keyof GradeOption;
    label: string;
  }

  const headCells: Array<Cell> = [
    {
      id: 'gradeId',
      label: 'Grade ID',
    },
    {
      id: 'grader',
      label: 'Grader',
    },
    {
      id: 'grade',
      label: 'Grade',
    },
    {
      id: 'date',
      label: 'Date',
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
    },
    {
      id: 'exportedToSisu',
      label: 'Exported',
    },
    {
      id: 'comment',
      label: 'Comment',
    },
  ];

  const bestGrade = findBestGradeOption(props.options, {
    avoidExpired: true,
    preferExpiredToNull: true,
    useLatest: false, // TODO: Read from state?
  });

  return (
    <Dialog
      open={props.open}
      transitionDuration={{exit: 800}}
      maxWidth="md"
      onClose={props.handleClose}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell: Cell) => (
                <TableCell key={cell.id}>{cell.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.options.map((option: GradeOption) => (
              <TableRow
                key={option.gradeId}
                style={{
                  border:
                    bestGrade?.gradeId === option.gradeId
                      ? `3px solid ${theme.palette.primary.main}`
                      : 'inherit',
                  backgroundColor: isGradeDateExpired(option.expiryDate)
                    ? `rgba(${theme.vars.palette.error.mainChannel} / 0.1)`
                    : 'inherit',
                }}
              >
                {headCells.map((cell: Cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 100,
                        color:
                          cell.id === 'expiryDate' &&
                          isGradeDateExpired(option.expiryDate)
                            ? 'error.main'
                            : 'inherit',
                        fontWeight:
                          cell.id === 'expiryDate' &&
                          isGradeDateExpired(option.expiryDate)
                            ? 'bold'
                            : 'inherit',
                      }}
                    >
                      {cell.id === 'grader'
                        ? option.grader.name
                        : option[cell.id] === null ||
                          option[cell.id] === undefined
                        ? '-'
                        : String(option[cell.id])}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{pr: 4, pb: 3}}>
        <Button size="medium" variant="outlined" onClick={props.handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
