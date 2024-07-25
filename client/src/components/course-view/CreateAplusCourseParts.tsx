// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Card, CardContent, TextField, Typography} from '@mui/material';
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
          <CardContent>
            {/* In case the teacher changes the course part's name, this is intended
                to show which source the course part was initially created from. */}
            <Typography>{coursePart.name}</Typography>
            <Typography>Max grade: {coursePart.maxGrade}</Typography>
            <TextField
              sx={{mt: 1}}
              label="Name"
              value={coursePart.name}
              onChange={e => handleChange(index, {name: e.target.value})}
            />
            <TextField
              sx={{mt: 1}}
              label="Days valid"
              type="number"
              value={coursePart.daysValid}
              onChange={e =>
                handleChange(index, {daysValid: Number(e.target.value)})
              }
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CreateAplusCourseParts;
