// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, FinalGrade } from 'aalto-grades-common/types';
import {
  Box, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from '../alerts/AlertSnackbar';
import StudentGradeList from './StudentGradeList';

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

  const grades: UseQueryResult<AttainmentGradeData> = useGetFinalGradesUser(
    courseId, assessmentModelId, props.user?.userId as number, { enabled: props.open }
  );

  // state variables handling the alert messages
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Individual grades for student {props.user?.studentNumber}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          {
            grades.data ?
              <StudentGradeList grades={grades.data} />
              : (
                <Box sx={{
                  margin: 'auto',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  mt: 5,
                  mb: 5
                }}>
                  {
                    grades.isError ? (
                      <Typography variant='body2'>
                      Error occured during operation. Please try again.
                      </Typography>
                    )
                      : (
                        <>
                          <CircularProgress sx={{ mr: 3 }}/>
                          {`Loading grades for ${props.user?.studentNumber}`}
                        </>
                      )}
                </Box>
              )}
        </DialogContent>
        <DialogActions sx={{ pr: 4, py: 3 }}>
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
