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
import {useTranslation} from 'react-i18next';

import {
  EditCourseTaskData,
  NewAplusGradeSourceData,
  NewCourseTaskData,
} from '@/common/types';

type CreateAplusCoursePartsProps = {
  courseTasksWithSource: [NewCourseTaskData, NewAplusGradeSourceData][];
  handleChange: (index: number, courseTask: EditCourseTaskData) => void;
};

const CreateAplusCourseParts = ({
  courseTasksWithSource,
  handleChange,
}: CreateAplusCoursePartsProps): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
      {courseTasksWithSource.map(([coursePart, _], index) => (
        <Card sx={{m: 1}}>
          <CardContent
            sx={{display: 'flex', flexDirection: 'column', width: 370}}
          >
            <TextField
              sx={{mt: 2}}
              label={t('general.name')}
              value={coursePart.name}
              onChange={e => handleChange(index, {name: e.target.value})}
            />
            <TextField
              sx={{mt: 2}}
              label={t('general.days-valid')}
              type="number"
              value={coursePart.daysValid ?? ''}
              onChange={e =>
                handleChange(index, {
                  daysValid:
                    e.target.value === '' ? null : Number(e.target.value),
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
                {t('general.max-grade')}: {coursePart.maxGrade}
              </Typography>
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
