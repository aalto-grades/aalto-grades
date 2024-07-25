// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Notes} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {JSX} from 'react';

import {NewAplusGradeSourceData} from '@/common/types';

type CreateAplusCoursePartsProps = {
  coursePartsWithSource: [
    {name: string; daysValid: number; maxGrade: number},
    NewAplusGradeSourceData,
  ][];
  handleChange: (
    index: number,
    coursePart: {name?: string; daysValid?: number}
  ) => void;
};

const CreateAplusCourseParts = ({
  coursePartsWithSource,
  handleChange,
}: CreateAplusCoursePartsProps): JSX.Element => {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
      {coursePartsWithSource.map(([coursePart, _], index) => (
        <Card sx={{m: 1}}>
          <CardContent
            sx={{display: 'flex', flexDirection: 'column', width: 370}}
          >
            <TextField
              sx={{mt: 2}}
              label="Name"
              value={coursePart.name}
              onChange={e => handleChange(index, {name: e.target.value})}
            />
            <TextField
              sx={{mt: 2}}
              label="Days valid"
              type="number"
              value={coursePart.daysValid}
              onChange={e =>
                handleChange(index, {daysValid: Number(e.target.value)})
              }
            />
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Typography>Max grade: {coursePart.maxGrade}</Typography>
              {/* In case the teacher changes the course part's name, this is intended
                  to show which source the course part was initially created from. */}
              <Tooltip title={coursePart.name}>
                <Notes />
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CreateAplusCourseParts;
