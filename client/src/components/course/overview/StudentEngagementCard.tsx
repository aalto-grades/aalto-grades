// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {BarChart} from '@mui/x-charts/BarChart';
import type {JSX} from 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import DashboardCard from '@/components/course/overview/DashboardCard';
import DetailItem from '@/components/course/overview/DetailItem';
import SimpleBarChart from '@/components/statistics/SimpleBarChart';

interface StudentEngagementCardProps {
  totalFinalGrades: number;
  passingCount: number;
  failingCount: number;
  exportedToSisu: number;
  notExportedToSisu: number;
  gradeDistribution: Array<{label: string; value: number}>;
  taskSubmissions: Array<{label: string; value: number}>;
  taskGradeDistribution: Array<{
    task: string;
    [key: string]: string | number;
  }>;
  canViewStats: boolean;
}

const StudentEngagementCard = ({
  totalFinalGrades,
  passingCount,
  failingCount,
  exportedToSisu,
  notExportedToSisu,
  gradeDistribution,
  taskSubmissions,
  taskGradeDistribution,
  canViewStats,
}: StudentEngagementCardProps): JSX.Element => {
  const {t} = useTranslation();
  const [statsView, setStatsView] = useState<
    'grades' | 'submissions' | 'combined'
  >('grades');

  if (!canViewStats) {
    return (
      <DashboardCard title={t('course.statistics.student-engagement')}>
        <Typography variant="body2" color="text.secondary">
          {t('course.dashboard.stats-restricted')}
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={t('course.statistics.student-engagement')}>
      <Stack spacing={1.5}>
        <DetailItem
          label={t('general.final-grades')}
          value={totalFinalGrades || 0}
        />
        <DetailItem
          label={t('course.statistics.passing')}
          value={passingCount || 0}
          subValue={
            totalFinalGrades
              ? `${((passingCount / totalFinalGrades) * 100).toFixed(0)}%`
              : undefined
          }
        />
        <DetailItem
          label={t('course.statistics.failing')}
          value={failingCount || 0}
        />
        <Divider />
        <DetailItem
          label={t('course.statistics.exported')}
          value={exportedToSisu || 0}
        />
        <DetailItem
          label={t('course.statistics.pending-export')}
          value={notExportedToSisu || 0}
          warning={!!notExportedToSisu}
        />
        <Divider />
        <Box sx={{pt: 0.5}}>
          <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
            <ToggleButtonGroup
              value={statsView}
              exclusive
              onChange={(_, newView) => {
                if (
                  newView === 'grades'
                  || newView === 'submissions'
                  || newView === 'combined'
                ) {
                  setStatsView(
                    newView as 'grades' | 'submissions' | 'combined',
                  );
                }
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.75,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <ToggleButton value="grades">
                {t('course.dashboard.grades')}
              </ToggleButton>
              <ToggleButton value="submissions">
                {t('course.dashboard.submissions')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box
            sx={{
              height: statsView === 'combined' ? 180 : 140,
              width: '100%',
            }}
          >
            {statsView === 'grades' && (
              <SimpleBarChart data={gradeDistribution} />
            )}
            {statsView === 'submissions' && (
              <SimpleBarChart data={taskSubmissions} />
            )}
            {statsView === 'combined' && (
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <BarChart
                  dataset={taskGradeDistribution}
                  skipAnimation
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'task',
                      disableLine: true,
                      disableTicks: true,
                      tickLabelStyle: {
                        angle: taskGradeDistribution.length > 3 ? -45 : 0,
                        textAnchor:
                          taskGradeDistribution.length > 3 ? 'end' : 'middle',
                        fontSize: 11,
                        fill: '#999',
                        fontWeight: 'bold',
                      },
                      categoryGapRatio: 0.2,
                      barGapRatio: 0.1,
                    },
                  ]}
                  yAxis={[
                    {
                      disableLine: true,
                      disableTicks: true,
                      tickLabelStyle: {
                        fontSize: 0,
                      },
                    },
                  ]}
                  series={[
                    {
                      dataKey: '0',
                      stack: 'total',
                      color: '#ef5350',
                      label: `${t('statistics.grade')} 0`,
                    },
                    {
                      dataKey: '1',
                      stack: 'total',
                      color: '#ff9800',
                      label: `${t('statistics.grade')} 1`,
                    },
                    {
                      dataKey: '2',
                      stack: 'total',
                      color: '#ffc107',
                      label: `${t('statistics.grade')} 2`,
                    },
                    {
                      dataKey: '3',
                      stack: 'total',
                      color: '#8bc34a',
                      label: `${t('statistics.grade')} 3`,
                    },
                    {
                      dataKey: '4',
                      stack: 'total',
                      color: '#66bb6a',
                      label: `${t('statistics.grade')} 4`,
                    },
                    {
                      dataKey: '5',
                      stack: 'total',
                      color: '#4caf50',
                      label: `${t('statistics.grade')} 5`,
                    },
                  ]}
                  borderRadius={8}
                  margin={{
                    top: 5,
                    bottom: taskGradeDistribution.length > 3 ? 45 : 25,
                    left: 5,
                    right: 5,
                  }}
                  grid={{vertical: false, horizontal: false}}
                  sx={{
                    '& .MuiChartsLegend-root': {
                      display: 'none',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default StudentEngagementCard;
