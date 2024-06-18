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

type PropsType = unknown;

const UploadDialogAplusImport = (props: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const fetchAplusGrades = useFetchAplusGrades(courseId, {enabled: false});

  const [step, setStep] = useState<number>(0);

  // Array of selected course part IDs
  const [selected, setSelected] = useState<number[]>([]);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    setAplusTokenDialogOpen(!getAplusToken() || fetchAplusGrades.isError);
  }, [fetchAplusGrades]);

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
                            setSelected(
                              e.target.checked
                                ? [...selected, coursePart.id]
                                : selected.filter(id => id !== coursePart.id)
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
              handleSubmit={() => {}}
              open={aplusTokenDialogOpen}
              error={fetchAplusGrades.isError}
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
          onClick={() => setStep(step + 1)}
          disabled={
            selected.length === 0 || (step === 1 && !fetchAplusGrades.data)
          }
        >
          Next
        </Button>
      </DialogActions>
    </>
  );
};

export default UploadDialogAplusImport;
