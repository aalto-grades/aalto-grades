// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Grid} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import StatCard from '@/components/statistics/StatCard';

interface MetricCardsProps {
  totalEnrolled: number;
  activeStudents: number;
  totalFinalGrades: number;
  medianGrade: number;
  passingAverageGrade: number;
  passingMedianGrade: number;
  passingCount: number;
  failingCount: number;
  activeRate: string;
  completionRate: string;
}

const MetricCards = ({
  totalEnrolled,
  activeStudents,
  totalFinalGrades,
  passingAverageGrade,
  passingMedianGrade,
  medianGrade,
  passingCount,
  failingCount,
  activeRate,
  completionRate,
}: MetricCardsProps): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Grid container spacing={2} sx={{mb: 3}}>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.total-students') || 'Total Students'}
          value={totalEnrolled}
          subtext={t('course.statistics.enrolled') || 'enrolled'}
        />
      </Grid>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.active') || 'Active'}
          value={activeStudents}
          subtext={`${activeRate}% ${t('course.statistics.engagement') || 'engagement'}`}
        />
      </Grid>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.completion') || 'Completion'}
          value={`${completionRate}%`}
          subtext={`${totalFinalGrades} ${t('course.statistics.graded') || 'graded'}`}
        />
      </Grid>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.average-grade') || 'Avg Grade'}
          value={passingAverageGrade.toFixed(2)}
          subtext={
            passingCount < totalFinalGrades
              ? `${t('course.statistics.passing-only') || 'passing only'} (${t('course.statistics.median') || 'median'}: ${passingMedianGrade.toFixed(2)})`
              : `${t('course.statistics.median') || 'median'}: ${medianGrade.toFixed(2)}`
          }
        />
      </Grid>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.passing') || 'Passing'}
          value={`${
            totalFinalGrades
              ? ((passingCount / totalFinalGrades) * 100).toFixed(1)
              : 0
          }%`}
          subtext={`${passingCount} ${t('course.statistics.students') || 'students'}`}
        />
      </Grid>
      <Grid size={{xs: 6, sm: 4, md: 2}}>
        <StatCard
          title={t('course.statistics.failing') || 'Failing'}
          value={`${
            totalFinalGrades
              ? ((failingCount / totalFinalGrades) * 100).toFixed(1)
              : 0
          }%`}
          subtext={`${failingCount} ${t('course.statistics.students') || 'students'}`}
        />
      </Grid>
    </Grid>
  );
};

export default MetricCards;
