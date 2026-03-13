// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import BarChartIcon from '@mui/icons-material/BarChart';
import NumbersIcon from '@mui/icons-material/Numbers';
import PercentIcon from '@mui/icons-material/Percent';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {BarChart, LineChart} from '@mui/x-charts';
import type {JSX} from 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

export type ChartType = 'line' | 'bar';
export type DisplayMode = 'percentage' | 'absolute';

export interface ChartSeries {
  data: (number | null)[];
  label: string;
  color?: string;
  stack?: string;
  yAxisKey?: string; // For dual Y-axis support
}

export interface FlexibleChartProps {
  title: string;
  xAxisData: (string | number)[];
  series: ChartSeries[];
  height?: number;
  defaultChartType?: ChartType;
  defaultDisplayMode?: DisplayMode;
  allowChartTypeToggle?: boolean;
  allowDisplayModeToggle?: boolean;
  forcePercentage?: boolean;
  yAxisConfig?: {
    min?: number;
    max?: number;
  };
  /** Configuration for left and right Y-axes when using dual axes */
  leftYAxis?: {
    min?: number;
    max?: number;
    label?: string;
  };
  rightYAxis?: {
    min?: number;
    max?: number;
    label?: string;
  };
  /** Wraps the chart in a Card component with standard styling */
  wrapInCard?: boolean;
  /** Grid configuration for the chart (e.g., {horizontal: true, vertical: true}) */
  gridConfig?: {horizontal?: boolean; vertical?: boolean};
  /** Custom styling for chart elements */
  chartSx?: Record<string, unknown>;
  /** Hide the legend */
  hideLegend?: boolean;
}

/**
 * Transforms absolute values to percentages for stacked data.
 * For each data point, calculates the percentage based on the total at that index.
 */
const transformToPercentage = (series: ChartSeries[]): ChartSeries[] => {
  if (series.length === 0) return series;

  const dataLength = series[0].data.length;
  const totals: number[] = [];

  // Calculate totals for each x-axis point
  for (let i = 0; i < dataLength; i++) {
    const total = series.reduce((sum, s) => {
      const value = s.data[i];
      return sum + (value ?? 0);
    }, 0);
    totals.push(total);
  }

  // Transform each series to percentages
  return series.map(s => ({
    ...s,
    data: s.data.map((value, index) => {
      if (value === null) return null;
      const total = totals[index];
      return total > 0 ? (value / total) * 100 : 0;
    }),
  }));
};

/**
 * Flexible chart component that supports line/bar charts and percentage/absolute display modes.
 * Can be configured to show/hide toggles and set default values.
 */
const FlexibleChart = ({
  title,
  xAxisData,
  series,
  height = 350,
  defaultChartType = 'line',
  defaultDisplayMode = 'absolute',
  allowChartTypeToggle = true,
  allowDisplayModeToggle = false,
  forcePercentage = false,
  yAxisConfig,
  leftYAxis,
  rightYAxis,
  wrapInCard = false,
  gridConfig,
  chartSx,
  hideLegend = false,
}: FlexibleChartProps): JSX.Element => {
  const {t} = useTranslation();
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    forcePercentage ? 'percentage' : defaultDisplayMode,
  );

  const showToggles =
    allowChartTypeToggle || (allowDisplayModeToggle && !forcePercentage);

  // Transform data to percentage if needed
  const isPercentageMode = forcePercentage || displayMode === 'percentage';
  const transformedSeries =
    isPercentageMode && allowDisplayModeToggle
      ? transformToPercentage(series)
      : series;

  // Format values based on display mode
  const formatValue = (value: number | null): string => {
    if (value === null) return '0';
    if (isPercentageMode) {
      return `${value.toFixed(1)}%`;
    }
    return `${Math.round(value)}`;
  };

  // Apply value formatter to transformed series
  const formattedSeries = transformedSeries.map(s => ({
    ...s,
    valueFormatter: (value: number | null) => formatValue(value),
  }));

  // Determine Y-axis configuration
  let yAxisConfiguration;
  if (leftYAxis || rightYAxis) {
    // Dual Y-axis configuration
    yAxisConfiguration = [
      {id: 'left', ...leftYAxis},
      {id: 'right', ...rightYAxis},
    ];
  } else if (yAxisConfig) {
    yAxisConfiguration = [yAxisConfig];
  } else if (isPercentageMode && allowDisplayModeToggle) {
    yAxisConfiguration = [{min: 0, max: 100}];
  } else {
    yAxisConfiguration = undefined;
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  const chartContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={wrapInCard ? '700' : '600'}>
          {title}
          {(forcePercentage || displayMode === 'percentage') && ' (%)'}
        </Typography>

        {showToggles && (
          <Box sx={{display: 'flex', gap: 1}}>
            {allowChartTypeToggle && (
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, newType) => {
                  if (newType !== null) {
                    setChartType(newType as ChartType);
                  }
                }}
                size="small"
                aria-label="chart type"
              >
                <ToggleButton value="line" aria-label="line chart">
                  <Tooltip title={t('statistics.line-chart') || 'Line Chart'}>
                    <ShowChartIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="bar" aria-label="bar chart">
                  <Tooltip title={t('statistics.bar-chart') || 'Bar Chart'}>
                    <BarChartIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {allowDisplayModeToggle && !forcePercentage && (
              <ToggleButtonGroup
                value={displayMode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    setDisplayMode(newMode as DisplayMode);
                  }
                }}
                size="small"
                aria-label="display mode"
              >
                <ToggleButton value="percentage" aria-label="percentage">
                  <Tooltip
                    title={t('statistics.show-percentage') || 'Show Percentage'}
                  >
                    <PercentIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="absolute" aria-label="absolute numbers">
                  <Tooltip
                    title={
                      t('statistics.show-numbers') || 'Show Absolute Numbers'
                    }
                  >
                    <NumbersIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
        )}
      </Box>

      <Box sx={wrapInCard ? {flexGrow: 1, width: '100%'} : undefined}>
        <ChartComponent
          height={height}
          xAxis={[
            {
              scaleType: chartType === 'line' ? 'point' : 'band',
              data: xAxisData,
            },
          ]}
          series={formattedSeries}
          yAxis={yAxisConfiguration}
          grid={gridConfig}
          sx={chartSx}
          {...(hideLegend ? {legend: {hidden: true}} : {})}
        />
      </Box>
    </>
  );

  if (wrapInCard) {
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
          {chartContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 3,
        borderRadius: 4,
        height: '100%',
      }}
    >
      {chartContent}
    </Box>
  );
};

export default FlexibleChart;
