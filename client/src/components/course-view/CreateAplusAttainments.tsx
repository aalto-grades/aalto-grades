// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Card, CardContent, TextField} from '@mui/material';
import {JSX} from 'react';

import {AplusGradeSourceData} from '@/common/types';

type CreateAplusAttainmentsProps = {
  attainmentsWithSource: [
    {name: string; daysValid: number},
    AplusGradeSourceData,
  ][];
  handleChange: (
    index: number,
    attainment: {name?: string; daysValid?: number}
  ) => void;
};

const CreateAplusAttainments = ({
  attainmentsWithSource,
  handleChange,
}: CreateAplusAttainmentsProps): JSX.Element => {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
      {attainmentsWithSource.map(([attainment, _], index) => (
        <Card sx={{m: 1}}>
          <CardContent>
            <TextField
              sx={{mt: 1}}
              label="Name"
              value={attainment.name}
              onChange={e => handleChange(index, {name: e.target.value})}
            />
            <TextField
              sx={{mt: 1}}
              label="Days valid"
              type="number"
              value={attainment.daysValid}
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

export default CreateAplusAttainments;
