// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetchAplusGrades, useGetCourseParts} from '../../hooks/useApi';
import {getAplusToken} from '../../utils/utils';
import AplusTokenDialog from '../shared/AplusTokenDialog';

const UploadDialogAplusImport = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);

  const [step, setStep] = useState<number>(0);
  const [coursePartIds, setCoursePartIds] = useState<number[]>([]);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const aplusGrades = useFetchAplusGrades(courseId, coursePartIds, {
    enabled: false,
  });

  useEffect(() => {
    setAplusTokenDialogOpen(!getAplusToken() || aplusGrades.isError);
  }, [aplusGrades]);

  return (
    <>
      {step === 0 && <DialogTitle>Select Course Parts</DialogTitle>}
      {step === 1 && <DialogTitle>Fetching Grades</DialogTitle>}
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
              handleClose={() => {}}
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
            <CircularProgress />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setStep(1);
            aplusGrades.refetch();
          }}
          disabled={coursePartIds.length === 0 || step === 1}
        >
          Next
        </Button>
      </DialogActions>
    </>
  );
};

export default UploadDialogAplusImport;
