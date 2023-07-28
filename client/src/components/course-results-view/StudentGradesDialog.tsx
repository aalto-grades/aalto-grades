// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, FinalGrade } from 'aalto-grades-common/types';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from '../alerts/AlertSnackbar';

import { useGetFinalGradesUser } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';

// A Dialog component for viewing users individual grades.
export default function StudentGradesDialog(props: {
  user: FinalGrade | null,
  setOpen: (open: boolean) => void,
  open: boolean
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const grades: UseQueryResult<Array<AttainmentGradeData>> = useGetFinalGradesUser(
    courseId, assessmentModelId, props.user?.userId as number, { enabled: props.open }
  );

  // state variables handling the alert messages
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  console.log(grades.isLoading);
  console.log(grades.data);

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >All grades for student {props.user?.studentNumber}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>










        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button
            size='medium'
            variant='outlined'
            onClick={(): void => {
              props.setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}

StudentGradesDialog.propTypes = {
  user: PropTypes.object,
  setOpen: PropTypes.func,
  open: PropTypes.bool
};
