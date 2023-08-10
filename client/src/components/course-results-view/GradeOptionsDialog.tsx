// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, GradeOption } from 'aalto-grades-common/types';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { JSX } from 'react';

export default function GradeOptionsDialog(props: {
  grade: AttainmentGradeData,
  open: boolean,
  handleClose: () => void
}): JSX.Element {

  return (
    <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
      <DialogTitle>Grade Options</DialogTitle>
      <DialogContent>
        {props.grade.grades.map((option: GradeOption) => (
          <pre key={option.gradeId}>
            <code>
              {JSON.stringify(option, undefined, 2)}
            </code>
          </pre>
        ))}
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
