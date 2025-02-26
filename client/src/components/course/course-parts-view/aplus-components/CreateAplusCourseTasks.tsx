// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  EditCourseTaskData,
  NewAplusGradeSourceData,
  NewCourseTaskData,
} from '@/common/types';

type PropsType = {
  courseTasksWithSource: [NewCourseTaskData, NewAplusGradeSourceData][];
  handleChange: (
    index: number,
    courseTask: Omit<EditCourseTaskData, 'id'>
  ) => void;
};
const CreateAplusCourseTasks = ({
  courseTasksWithSource,
  handleChange,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
      {courseTasksWithSource.map(([courseTask], index) => (
        <Card key={index} sx={{m: 1}}>
          <CardContent
            sx={{display: 'flex', flexDirection: 'column', width: 370}}
          >
            <TextField
              sx={{mt: 2}}
              label={t('general.name')}
              value={courseTask.name}
              onChange={e => handleChange(index, {name: e.target.value})}
            />
            <TextField
              sx={{mt: 2}}
              label={t('general.days-valid')}
              type="string"
              inputMode="numeric"
              value={courseTask.daysValid ?? ''}
              // Cast input to a number
              // I'd rather show a warning but this works fine enough
              onChange={e =>
                handleChange(index, {
                  daysValid: !/^[1-9]+\d*$/.test(e.target.value)
                    ? null
                    : Number(e.target.value),
                })
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
              <Typography>
                {t('general.max-grade')}: {courseTask.maxGrade}
              </Typography>
              {/* In case the teacher changes the course task's name, this is intended
                  to show which source the course task was initially created from. */}
              <Tooltip title={courseTask.name}>
                <Notes />
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CreateAplusCourseTasks;
