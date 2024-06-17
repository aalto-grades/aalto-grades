// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetchAplusGrades, useGetCourseParts} from '../../hooks/useApi';
import AplusTokenDialog from '../shared/AplusTokenDialog';

type PropsType = {
  step: number;
};

const UploadDialogAplusImport = ({step}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const fetchAplusGrades = useFetchAplusGrades(courseId, {enabled: false});

  return (
    <>
      {step === 0 && <DialogTitle>Select Course Parts</DialogTitle>}
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
                      control={<Checkbox />}
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
              open={step === 1}
              error={false}
            />
            <p>Loading</p>
          </>
        )}
      </DialogContent>
    </>
  );
};

export default UploadDialogAplusImport;
