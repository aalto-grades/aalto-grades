// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Card, CardContent, Typography} from '@mui/material';
import {LineChart} from '@mui/x-charts/LineChart';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

interface PerformanceOverTimeChartProps {
  timelineDates: string[];
  timelineAverages: number[];
  timelineCounts: number[];
}

const PerformanceOverTimeChart = ({
  timelineDates,
  timelineAverages,
  timelineCounts,
}: PerformanceOverTimeChartProps): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{
        height: 420,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent
        sx={{height: '100%', display: 'flex', flexDirection: 'column'}}
      >
        <Typography variant="h6" fontWeight="700" sx={{mb: 2}}>
          {t('course.statistics.grade-timeline') || 'Performance Over Time'}
        </Typography>
        <Box sx={{flexGrow: 1, width: '100%'}}>
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: timelineDates,
                label: t('course.statistics.date') || 'Date',
                tickLabelStyle: {fontSize: 12, fill: '#666'},
              },
            ]}
            series={[
              {
                data: timelineAverages,
                label: t('course.statistics.avg-grade') || 'Avg Grade',
                curve: 'catmullRom',
                color: '#ff9800',
                showMark: true,
                yAxisId: 'gradeAxis',
                area: true,
              },
              {
                data: timelineCounts,
                label: t('course.statistics.submission-count') || 'Count',
                curve: 'step',
                color: '#009688',
                yAxisId: 'countAxis',
              },
            ]}
            yAxis={[
              {
                id: 'gradeAxis',
                scaleType: 'linear',
                label: 'Grade',
                max: 5,
              },
              {
                id: 'countAxis',
                scaleType: 'linear',
                label: 'Count',
                position: 'right',
              },
            ]}
            grid={{horizontal: true, vertical: true}}
            sx={{
              '.MuiLineElement-root': {
                strokeWidth: 3,
              },
              '.MuiAreaElement-root': {
                fillOpacity: 0.1,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverTimeChart;
