// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Typography,
} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  useAddGrades,
  useFetchAplusGrades,
  useGetCourseParts,
} from '../../hooks/useApi';
import {getAplusToken} from '../../utils/utils';
import AplusTokenDialog from '../shared/AplusTokenDialog';

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusImportDialog = ({handleClose, open}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);

  const [step, setStep] = useState<number>(0);
  const [coursePartIds, setCoursePartIds] = useState<number[]>([]);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const addGrades = useAddGrades(courseId);
  const aplusGrades = useFetchAplusGrades(courseId, coursePartIds, {
    enabled: false,
  });

  useEffect(() => {
    if (aplusGrades.data) {
      addGrades.mutate(aplusGrades.data);
      handleClose();
      return;
    }

    setAplusTokenDialogOpen(!getAplusToken() || aplusGrades.isError);
  }, [aplusGrades]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setCoursePartIds([]);
    setAplusTokenDialogOpen(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleResetAndClose}>
      {step === 0 && <DialogTitle>Select course parts</DialogTitle>}
      {step === 1 && <DialogTitle>Fetching grades</DialogTitle>}
      <DialogContent>
        {step === 0 && (
          <>
            <Typography>
              Select the course parts you want to fetch grades for from A+.
            </Typography>
            <FormGroup>
              {courseParts.data &&
                courseParts.data
                  .filter(coursePart => coursePart.aplusGradeSources.length > 0)
                  .map(coursePart => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={e =>
                            setCoursePartIds(
                              e.target.checked
                                ? [...coursePartIds, coursePart.id]
                                : coursePartIds.filter(
                                    id => id !== coursePart.id
                                  )
                            )
                          }
                        />
                      }
                      label={coursePart.name}
                    />
                  ))}
            </FormGroup>
          </>
        )}
        {step === 1 && (
          <>
            <AplusTokenDialog
              handleClose={handleResetAndClose}
              handleSubmit={() => {
                setAplusTokenDialogOpen(false);
                aplusGrades.refetch();
              }}
              open={aplusTokenDialogOpen}
              error={aplusGrades.isError}
            />
            <Typography>
              Fetching grades from A+, this may take a few minutes...
            </Typography>
            <LinearProgress sx={{mt: 2}} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        {step === 0 && (
          <Button
            onClick={() => {
              setStep(1);
              if (getAplusToken()) {
                aplusGrades.refetch();
              }
            }}
            disabled={coursePartIds.length === 0}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AplusImportDialog;
