// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Checkbox,
  CircularProgress,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {CoursePartData} from '@/common/types';
import {useFetchAplusGrades, useGetCourseParts} from '../../hooks/useApi';
import AplusTokenDialog from '../shared/AplusTokenDialog';

type PropsType = {
  step: number;
};

const UploadDialogAplusImport = ({step}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const fetchAplusGrades = useFetchAplusGrades(courseId, {enabled: false});

  const [selected, setSelected] = useState<CoursePartData[]>([]);

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
                                ? [...selected, coursePart]
                                : selected.filter(s => s.id !== coursePart.id)
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
              open={step === 1}
              error={false}
            />
            <Typography>
              Fetching grades from A+, this may take a few minutes...
            </Typography>
            <CircularProgress />
          </>
        )}
      </DialogContent>
    </>
  );
};

export default UploadDialogAplusImport;
