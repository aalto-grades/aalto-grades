// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import BarChartIcon from '@mui/icons-material/BarChart';
import SchoolIcon from '@mui/icons-material/School';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  Fade,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {DataGrid, type GridColDef} from '@mui/x-data-grid';
import {keepPreviousData} from '@tanstack/react-query';
import type {JSX} from 'react';
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import StatCard from '@/components/statistics/StatCard';
import {useGetAllCourses} from '@/hooks/api/course';
import {useGetGlobalStatistics} from '@/hooks/api/statistics';
import {
  aggregateYearlyStats,
  calculateGradeMetrics,
  calculateRates,
  generateGradeDistributionSeries,
  generateGradeTrendsSeries,
  generateStudentCountSeries,
  generateSuccessMetricsSeries,
} from '@/utils/globalStatisticsHelpers';
import {getDateRangeFromYear} from '@/utils/statisticsHelpers';
import FlexibleChart from './course/statistics/FlexibleChart';

const GlobalStatisticsView = (): JSX.Element => {
  const {t, i18n} = useTranslation();
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [grouping, setGrouping] = useState<'CALENDAR' | 'ACADEMIC' | 'COURSE'>(
    'ACADEMIC',
  );
  const [selectedYear, setSelectedYear] = useState<string>('All');

  const {data: allCourses} = useGetAllCourses();

  // Fetch unfiltered stats to get all available years (no date filter)
  const {data: allStats} = useGetGlobalStatistics(
    {
      courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
      search: searchTerm || undefined,
      grouping,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  // Calculate date range based on grouping and selected year
  const dateParams = useMemo(() => {
    const {startDate, endDate} = getDateRangeFromYear(grouping, selectedYear);
    return startDate && endDate ? {startDate, endDate} : {};
  }, [grouping, selectedYear]);

  // Fetch filtered stats for display
  const {
    data: stats,
    isLoading,
    isFetching,
    error,
  } = useGetGlobalStatistics(
    {
      courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
      search: searchTerm || undefined,
      grouping,
      ...dateParams,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  // Calculate available years dynamically from unfiltered data
  const availableYears = useMemo(() => {
    if (!allStats?.yearlyStatistics || allStats.yearlyStatistics.length === 0) {
      // Fallback: show last 5 years if no data yet
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      const years = [];

      if (grouping === 'CALENDAR') {
        for (let i = 0; i < 5; i++) {
          years.push(`${currentYear - i}`);
        }
      } else {
        // ACADEMIC or COURSE: determine current academic year first
        // Academic year starts in August (month 7)
        const currentAcademicStartYear =
          currentMonth < 7 ? currentYear - 1 : currentYear;
        for (let i = 0; i < 5; i++) {
          const startYear = currentAcademicStartYear - i;
          years.push(`${startYear}-${startYear + 1}`);
        }
      }
      return years;
    }

    // Extract unique years from actual data and sort descending (newest first)
    const years = Array.from(
      new Set(allStats.yearlyStatistics.map(s => String(s.year))),
    ).sort((a, b) => {
      // Handle both numeric years (2024) and academic years ("2024-2025")
      const aYear = Number.parseInt(a.split('-')[0]);
      const bYear = Number.parseInt(b.split('-')[0]);
      return bYear - aYear; // Descending order
    });

    return years;
  }, [allStats, grouping]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no stats are available after loading, show message
  if (!stats) {
    return (
      <Box sx={{p: 3}}>
        <Typography color="error" gutterBottom>
          {error
            ? `Error loading statistics: ${error.message}`
            : 'No statistics available'}
        </Typography>
        {error && (
          <Typography variant="body2" color="text.secondary">
            Please make sure you are logged in and have the necessary
            permissions.
          </Typography>
        )}
      </Box>
    );
  }

  // Define columns for the report table
  const columns: GridColDef[] = [
    {
      field: 'courseCode',
      headerName: t('statistics.course-code'),
      width: 150,
    },
    {
      field: 'courseName',
      headerName: t('statistics.course-name'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'totalEnrolled',
      headerName: t('statistics.total-enrolled'),
      type: 'number',
      width: 150,
    },
    {
      field: 'totalStudents',
      headerName: t('statistics.total-graded'),
      type: 'number',
      width: 150,
    },
    {
      field: 'averageGrade',
      headerName: t('statistics.average-grade'),
      type: 'number',
      width: 150,
      valueFormatter: value => (value as number).toFixed(2),
    },
    {
      field: 'medianGrade',
      headerName: t('statistics.median-grade'),
      type: 'number',
      width: 150,
      valueFormatter: value => (value as number).toFixed(2),
    },
    {
      field: 'passRate',
      headerName: t('statistics.pass-rate'),
      type: 'number',
      width: 130,
      valueFormatter: value => `${(value as number).toFixed(1)}%`,
    },
    {
      field: 'completionRate',
      headerName: t('statistics.completion-rate'),
      type: 'number',
      width: 150,
      valueFormatter: value => `${(value as number).toFixed(1)}%`,
    },
  ];

  const tableRows = (stats.courseStatistics || []).map((course) => {
    const aggregated = aggregateYearlyStats(course.yearlyStatistics);
    const {averageGrade, medianGrade} = calculateGradeMetrics(
      aggregated.gradeDistribution,
    );
    const {passRate, completionRate} = calculateRates(aggregated);

    return {
      id: course.courseId,
      courseCode: course.courseCode,
      courseName:
        course.courseName[i18n.language as 'fi' | 'en' | 'sv']
        || course.courseName.en
        || course.courseName.fi,
      totalEnrolled: aggregated.totalEnrolled,
      totalStudents: aggregated.totalStudents,
      averageGrade,
      medianGrade,
      passRate,
      completionRate,
    };
  });

  return (
    <Box sx={{p: 3, maxWidth: 1600, mx: 'auto'}}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
            {t('statistics.global-statistics')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('statistics.global-statistics-description')}
          </Typography>
        </Box>
      </Box>

      <Fade in={isFetching && !isLoading}>
        <LinearProgress sx={{mb: 2, borderRadius: 1}} />
      </Fade>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{p: 4, mb: 4, borderRadius: 3, bgcolor: 'background.paper'}}
      >
        <Typography variant="h6" gutterBottom sx={{mb: 3, fontWeight: 600}}>
          {t('statistics.filter-options') || 'Filter Options'}
        </Typography>

        <Grid container spacing={3}>
          {/* Row 1: Course Selection and Search */}
          <Grid size={{xs: 12, md: 8}}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              limitTags={3}
              id="course-selection"
              options={allCourses || []}
              getOptionLabel={option =>
                `${option.courseCode} - ${option.name.en || option.name.fi}`}
              value={
                allCourses
                  ? allCourses.filter(course =>
                      selectedCourseIds.includes(course.id),
                    )
                  : []
              }
              onChange={(_, newValue) => {
                setSelectedCourseIds(newValue.map(course => course.id));
              }}
              renderOption={(props, option, {selected}) => (
                <li {...props}>
                  <Checkbox style={{marginRight: 8}} checked={selected} />
                  {option.courseCode}
                  {' - '}
                  {option.name.en || option.name.fi}
                </li>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('statistics.filter-by-courses')}
                  placeholder={t('course.select')}
                />
              )}
            />
          </Grid>
          <Grid size={{xs: 12, md: 4}}>
            <TextField
              fullWidth
              label={t('common.search-courses')}
              variant="outlined"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Grid>

          {/* Row 2: Grouping and Year Filter */}
          <Grid size={{xs: 12, md: 6}}>
            <FormControl component="fieldset" fullWidth>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                {t('statistics.group-by')}
              </Typography>
              <RadioGroup
                row
                value={grouping}
                onChange={(e) => {
                  setGrouping(
                    e.target.value as 'CALENDAR' | 'ACADEMIC' | 'COURSE',
                  );
                  setSelectedYear('All');
                }}
                sx={{gap: 2}}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    border:
                      grouping === 'CALENDAR'
                        ? '1px solid primary.main'
                        : '1px solid rgba(0, 0, 0, 0.12)',
                    bgcolor:
                      grouping === 'CALENDAR'
                        ? 'action.selected'
                        : 'transparent',
                  }}
                >
                  <FormControlLabel
                    value="CALENDAR"
                    control={<Radio size="small" />}
                    label={t('statistics.calendar-year')}
                    sx={{m: 0}}
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    border:
                      grouping === 'ACADEMIC'
                        ? '1px solid primary.main'
                        : '1px solid rgba(0, 0, 0, 0.12)',
                    bgcolor:
                      grouping === 'ACADEMIC'
                        ? 'action.selected'
                        : 'transparent',
                  }}
                >
                  <FormControlLabel
                    value="ACADEMIC"
                    control={<Radio size="small" />}
                    label={t('statistics.academic-year')}
                    sx={{m: 0}}
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    border:
                      grouping === 'COURSE'
                        ? '1px solid primary.main'
                        : '1px solid rgba(0, 0, 0, 0.12)',
                    bgcolor:
                      grouping === 'COURSE' ? 'action.selected' : 'transparent',
                    opacity: selectedCourseIds.length === 0 ? 0.5 : 1,
                  }}
                >
                  <FormControlLabel
                    value="COURSE"
                    control={<Radio size="small" />}
                    label={t('statistics.course')}
                    disabled={selectedCourseIds.length === 0}
                    sx={{m: 0}}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth>
              <InputLabel>{t('statistics.filter-year')}</InputLabel>
              <Select
                value={selectedYear}
                label={t('statistics.filter-year')}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <MenuItem value="All">{t('common.all') || 'All'}</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            title={t('statistics.total-students')}
            value={stats.totalStudents}
            icon={<SchoolIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            title={t('statistics.pass-rate')}
            value={`${stats.passRate.toFixed(1)}%`}
            icon={<ShowChartIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            title={t('statistics.completion-rate')}
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={<BarChartIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            title={t('statistics.average-grade')}
            value={stats.averageGrade.toFixed(2)}
            subtext={`${t('statistics.median-grade')}: ${stats.medianGrade.toFixed(2)}`}
            icon={<BarChartIcon fontSize="large" />}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Success Metrics */}
        <Grid size={{xs: 12, md: 6}}>
          <FlexibleChart
            title={t('statistics.success-metrics')}
            xAxisData={
              grouping === 'COURSE' && stats.courseStatistics
                ? stats.courseStatistics.map(c => c.courseCode)
                : stats.yearlyStatistics.map(s => s.year).reverse()
            }
            series={generateSuccessMetricsSeries(stats, grouping, t)}
            height={350}
            defaultChartType="line"
            forcePercentage
            yAxisConfig={{min: 0, max: 100}}
          />
        </Grid>

        {/* Students per Year */}
        <Grid size={{xs: 12, md: 6}}>
          <FlexibleChart
            title={
              grouping === 'COURSE'
                ? t('statistics.total-students-per-course')
                : t('statistics.total-students-per-year')
            }
            xAxisData={
              grouping === 'COURSE' && stats.courseStatistics
                ? stats.courseStatistics.map(c => c.courseCode)
                : stats.yearlyStatistics.map(s => s.year).reverse()
            }
            series={generateStudentCountSeries(stats, grouping, t)}
            height={350}
            defaultChartType="bar"
            allowChartTypeToggle
            allowDisplayModeToggle
          />
        </Grid>

        {/* Grade Distribution Stacked */}
        <Grid size={{xs: 12}}>
          <FlexibleChart
            title={t('statistics.grade-distribution')}
            xAxisData={
              grouping === 'COURSE' && stats.courseStatistics
                ? stats.courseStatistics.map(c => c.courseCode)
                : stats.yearlyStatistics.map(s => s.year).reverse()
            }
            series={generateGradeDistributionSeries(stats, grouping, t)}
            height={400}
            defaultChartType="bar"
            allowChartTypeToggle
            allowDisplayModeToggle
          />
        </Grid>

        {/* Grade Trends */}
        <Grid size={{xs: 12}}>
          <FlexibleChart
            title={t('statistics.grade-trends')}
            xAxisData={
              grouping === 'COURSE' && stats.courseStatistics
                ? stats.courseStatistics.map(c => c.courseCode)
                : stats.yearlyStatistics.map(s => s.year).reverse()
            }
            series={generateGradeTrendsSeries(stats, grouping, t)}
            height={400}
            defaultChartType="line"
            allowChartTypeToggle
          />
        </Grid>
      </Grid>

      {/* Comparison Charts */}
      {stats.courseStatistics && stats.courseStatistics.length > 1 && (
        <Grid container spacing={3} sx={{mt: 3}}>
          <Grid size={{xs: 12}}>
            <FlexibleChart
              title={t('statistics.course-comparison-avg-grade')}
              xAxisData={Array.from(
                new Set(
                  stats.courseStatistics.flatMap(c =>
                    c.yearlyStatistics.map(s => s.year),
                  ),
                ),
              ).sort((a: number | string, b: number | string) =>
                String(a) > String(b) ? 1 : -1,
              )}
              series={stats.courseStatistics.map((course) => {
                // Create a map of year -> avgGrade for this course
                const gradeMap = new Map(
                  course.yearlyStatistics.map(s => [s.year, s.averageGrade]),
                );
                // Get all years
                const allYears = Array.from(
                  new Set(
                    stats.courseStatistics!.flatMap(c =>
                      c.yearlyStatistics.map(s => s.year),
                    ),
                  ),
                ).sort((a: number | string, b: number | string) =>
                  String(a) > String(b) ? 1 : -1,
                );

                return {
                  data: allYears.map(year => gradeMap.get(year) ?? null),
                  label: `${course.courseCode} - ${course.courseName[i18n.language as 'fi' | 'en' | 'sv'] || course.courseName.en || course.courseName.fi}`,
                };
              })}
              height={400}
              defaultChartType="line"
              allowChartTypeToggle
            />
          </Grid>
        </Grid>
      )}

      {/* Detailed Report Table */}
      <Box sx={{mt: 4, bgcolor: 'background.paper', p: 3, borderRadius: 4}}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          {t('statistics.detailed-report')}
        </Typography>
        <Box sx={{height: 600, width: '100%'}}>
          <DataGrid
            rows={tableRows}
            columns={columns}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: {page: 0, pageSize: 10},
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalStatisticsView;
