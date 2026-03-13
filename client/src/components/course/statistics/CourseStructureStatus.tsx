// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {Box, Card, Chip, Grid, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

interface CourseStructureStatusProps {
  totalCourseParts: number;
  expiredCourseParts: number;
  totalTaskGrades: number;
  expiredTaskGrades: number;
  exportedToSisu: number;
  notExportedToSisu: number;
}

const CourseStructureStatus = ({
  totalCourseParts,
  expiredCourseParts,
  totalTaskGrades,
  expiredTaskGrades,
  exportedToSisu,
  notExportedToSisu,
}: CourseStructureStatusProps): JSX.Element => {
  const {t} = useTranslation();

  const hasExpiredContent =
    (expiredCourseParts || 0) > 0 || (expiredTaskGrades || 0) > 0;

  return (
    <Card
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        ...(hasExpiredContent && {
          borderColor: 'warning.main',
          borderWidth: 2,
        }),
      }}
      elevation={0}
      variant="outlined"
    >
      {hasExpiredContent && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1,
            bgcolor: 'warning.lighter',
            borderRadius: 2,
          }}
        >
          <WarningAmberIcon color="warning" fontSize="small" />
          <Typography variant="caption" color="warning.dark" fontWeight="600">
            {t('course.statistics.expired-content-warning')
              || 'Some content has expired and may need attention'}
          </Typography>
        </Box>
      )}

      <Grid container spacing={3} alignItems="center">
        <Grid size={{xs: 6, sm: 3}}>
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {totalCourseParts || 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('course.statistics.course-parts') || 'Course Parts'}
            </Typography>
            {(expiredCourseParts || 0) > 0 && (
              <Chip
                icon={<WarningAmberIcon />}
                label={`${expiredCourseParts} ${t('course.statistics.expired') || 'expired'}`}
                color="warning"
                size="small"
                sx={{mt: 0.5}}
              />
            )}
          </Box>
        </Grid>
        <Grid size={{xs: 6, sm: 3}}>
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {totalTaskGrades || 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('course.statistics.task-grades') || 'Task Grades'}
            </Typography>
            {(expiredTaskGrades || 0) > 0 && (
              <Chip
                icon={<WarningAmberIcon />}
                label={`${expiredTaskGrades} ${t('course.statistics.expired') || 'expired'}`}
                color="warning"
                size="small"
                sx={{mt: 0.5}}
              />
            )}
          </Box>
        </Grid>
        <Grid size={{xs: 6, sm: 3}}>
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {exportedToSisu || 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('course.statistics.exported') || 'Exported to Sisu'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{xs: 6, sm: 3}}>
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {notExportedToSisu || 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('course.statistics.pending-export') || 'Pending Export'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default CourseStructureStatus;
