// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Card, CardContent, TextField} from '@mui/material';

import {AplusGradeSourceData} from '@/common/types';

type AttainmentCardProps = {
  attainment: {name: string; daysValid: number};
  handleChange: (attainment: {name?: string; daysValid?: number}) => void;
};

const AttainmentCard = ({
  attainment,
  handleChange,
}: AttainmentCardProps): JSX.Element => {
  return (
    <Card>
      <CardContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          value={attainment.name}
          onChange={e => handleChange({name: e.target.value})}
        />
        <TextField
          sx={{mt: 1}}
          label="Days valid"
          type="number"
          value={attainment.daysValid}
          onChange={e => handleChange({daysValid: Number(e.target.value)})}
        />
      </CardContent>
    </Card>
  );
};

type CreateAplusAttainmentsProps = {
  aplusCourseId: number;
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
  aplusCourseId,
  attainmentsWithSource,
  handleChange,
}: CreateAplusAttainmentsProps): JSX.Element => {
  return (
    <>
      {attainmentsWithSource.map(([a, _], i) => (
        <AttainmentCard
          attainment={a}
          handleChange={attainment => handleChange(i, attainment)}
        />
      ))}
    </>
  );
};

export default CreateAplusAttainments;
