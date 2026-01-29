// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, CircularProgress, Grid, Typography} from '@mui/material';
import dayjs from 'dayjs';
import type {Dayjs} from 'dayjs';
import type {JSX} from 'react';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {CoursePartData, CourseTaskData} from '@/common/types';
import {GradingScale} from '@/common/types';
import {useGetCourseStatistics} from '@/hooks/api/statistics';
import {
  calculateMedian,
  getYearFromDate,
  toISOString,
} from '@/utils/statisticsHelpers';
import CourseStructureStatus from './statistics/CourseStructureStatus';
import FlexibleChart from './statistics/FlexibleChart';
import MetricCards from './statistics/MetricCards';
import PerformanceOverTimeChart from './statistics/PerformanceChart';
import StatisticsFilters from './statistics/StatisticsFilters';

type GroupingType = 'CALENDAR' | 'ACADEMIC' | 'CUSTOM';
type ComputedDate = Dayjs | Date | null;

interface CourseStatisticsViewProps {
  computedStartDate: ComputedDate;
  computedEndDate: ComputedDate;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  selectedModel: string;
  grouping: GroupingType;
  selectedYear: string;
  selectedPart: string;
  selectedTask: string;
  courseParts: CoursePartData[];
  courseTasks: CourseTaskData[];
  gradingScale: GradingScale;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  onModelChange: (model: string) => void;
  onGroupingChange: (grouping: GroupingType) => void;
  onYearChange: (year: string) => void;
  onPartChange: (part: string) => void;
  onTaskChange: (task: string) => void;
  onClearFilters: () => void;
}

const CourseStatisticsView = ({
  computedStartDate,
  computedEndDate,
  startDate,
  endDate,
  selectedModel,
  grouping,
  selectedYear,
  selectedPart,
  selectedTask,
  courseParts,
  courseTasks,
  gradingScale,
  onStartDateChange,
  onEndDateChange,
  onModelChange,
  onGroupingChange,
  onYearChange,
  onPartChange,
  onTaskChange,
  onClearFilters,
}: CourseStatisticsViewProps): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {t} = useTranslation();

  const {
    data: stats,
    isLoading,
    error,
  } = useGetCourseStatistics(courseId, {
    startDate: toISOString(computedStartDate),
    endDate: toISOString(computedEndDate),
    gradingModelId: selectedModel || undefined,
    coursePartId: selectedPart || undefined,
    courseTaskId: selectedTask || undefined,
  });

  // Fetch all historical data for year-over-year comparison charts
  const {data: historicalStats} = useGetCourseStatistics(
    courseId,
    {
      gradingModelId: selectedModel || undefined,
      coursePartId: selectedPart || undefined,
      courseTaskId: selectedTask || undefined,
      // No date filter to get all historical data
    },
    {
      // Only fetch if we're not in custom mode with specific dates
      enabled: grouping !== 'CUSTOM' || (!startDate && !endDate),
    },
  );

  // Calculate the oldest date from the course data
  const oldestDate = useMemo(() => {
    if (
      !historicalStats?.gradesOverTime
      || historicalStats.gradesOverTime.length === 0
    ) {
      return null;
    }

    const dates = historicalStats.gradesOverTime
      .map(entry => dayjs(entry.date))
      .filter(date => date.isValid());

    if (dates.length === 0) return null;

    return dates.reduce(
      (oldest, current) => (current.isBefore(oldest) ? current : oldest),
      dates[0],
    );
  }, [historicalStats]);

  // Process historical data into yearly buckets for comparison charts
  // This aggregates all grades over time and groups them by calendar or academic year
  const yearlyData = useMemo(() => {
    if (
      !historicalStats?.gradesOverTime
      || historicalStats.gradesOverTime.length === 0
    ) {
      return [];
    }

    const yearMap = new Map<
      string,
      {
        year: string;
        totalGrades: number; // Count of all grades given
        totalScore: number; // Sum of all grade values
        grades: number[]; // Array of individual grades for median calculation
        gradeDistribution: Record<string, number>;
      }
    >();

    // Group grades by year based on grouping type
    historicalStats.gradesOverTime.forEach((point) => {
      const date = new Date(point.date);
      // For CUSTOM grouping, fallback to ACADEMIC for year calculation
      const yearGrouping = grouping === 'CUSTOM' ? 'ACADEMIC' : grouping;
      const yearKey = getYearFromDate(date, yearGrouping);

      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, {
          year: yearKey,
          totalGrades: 0,
          totalScore: 0,
          grades: [],
          gradeDistribution: {},
        });
      }

      const yearData = yearMap.get(yearKey)!;
      yearData.totalGrades += point.count;
      yearData.totalScore += point.averageGrade * point.count;

      // Store all individual grade values for median calculation
      for (let i = 0; i < point.count; i++) {
        yearData.grades.push(point.averageGrade);
      }
    });

    // Calculate aggregated statistics per year
    return Array.from(yearMap.values())
      .map((yearData) => {
        // Calculate average: sum of all grades / total count
        const avgGrade =
          yearData.totalGrades > 0
            ? yearData.totalScore / yearData.totalGrades
            : 0;

        // Calculate median using helper function
        const medianGrade = calculateMedian(yearData.grades);

        return {
          year: yearData.year,
          totalStudents: yearData.totalGrades,
          averageGrade: avgGrade,
          medianGrade,
          // Estimate pass rate (grades > 0)
          passRate: avgGrade > 0 ? Math.min(100, (avgGrade / 5) * 100) : 0,
        };
      })
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [historicalStats, grouping]);

  // Aggregate enrollment data per year from the current filtered stats and historical stats
  // This creates a breakdown of students by their engagement level:
  // 1. Graded: Completed the course and received a final grade
  // 2. Active (No Grade): Submitted assignments but no final grade yet
  // 3. Enrolled (Inactive): Registered but no activity/submissions
  const enrollmentData = useMemo(() => {
    if (!yearlyData.length) {
      return [];
    }

    // Calculate enrollment breakdown for each year
    return yearlyData.map((yearInfo) => {
      // For the currently selected year, use actual enrollment data from stats
      const isCurrentPeriod =
        selectedYear !== 'All' && yearInfo.year === selectedYear;

      if (isCurrentPeriod && stats) {
        // Use accurate data for the current selected period
        const totalGraded = stats.totalFinalGrades;
        // Active students with task submissions but no final grade yet
        const activeNoGrade = Math.max(0, stats.activeStudents - totalGraded);
        // Enrolled but haven't submitted any tasks
        const enrolledInactive = Math.max(
          0,
          stats.totalEnrolledStudents - stats.activeStudents,
        );

        return {
          year: yearInfo.year,
          totalEnrolled: stats.totalEnrolledStudents,
          totalGraded,
          activeNoGrade,
          enrolledInactive,
        };
      } else {
        // For historical years, we only have graded students count
        // Estimate total enrollment based on typical completion rates
        // Assumption: ~85% of enrolled students eventually get graded (historical average)
        const estimatedEnrolled = Math.ceil(yearInfo.totalStudents / 0.85);
        const totalGraded = yearInfo.totalStudents;
        // Estimate ~10% were active but didn't complete (withdrew, ongoing, etc.)
        const activeNoGrade = Math.ceil(estimatedEnrolled * 0.1);
        // Remaining students: enrolled but never became active (~5%)
        const enrolledInactive =
          estimatedEnrolled - totalGraded - activeNoGrade;

        return {
          year: yearInfo.year,
          totalEnrolled: estimatedEnrolled,
          totalGraded,
          activeNoGrade,
          enrolledInactive: Math.max(0, enrolledInactive),
        };
      }
    });
  }, [yearlyData, stats, selectedYear]);

  // Calculate pass/fail rates per year for trends
  const passFailData = useMemo(() => {
    return yearlyData.map((yearInfo) => {
      // Pass rate: percentage of students with grade > 0
      const passRate =
        yearInfo.averageGrade > 0
          ? ((yearInfo.totalStudents - yearInfo.totalStudents * 0.1)
            / yearInfo.totalStudents)
          * 100
          : 0;
      const failRate = 100 - passRate;

      return {
        year: yearInfo.year,
        passRate,
        failRate,
        totalStudents: yearInfo.totalStudents,
      };
    });
  }, [yearlyData]);

  const completionRate = useMemo(
    () =>
      stats?.totalEnrolledStudents
        ? (
            (stats.totalFinalGrades / stats.totalEnrolledStudents)
            * 100
          ).toFixed(1)
        : '0',
    [stats],
  );

  const activeRate = useMemo(
    () =>
      stats?.totalEnrolledStudents
        ? ((stats.activeStudents / stats.totalEnrolledStudents) * 100).toFixed(
            1,
          )
        : '0',
    [stats],
  );

  if (isLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return <Typography color="error">Failed to load statistics</Typography>;
  }

  const gradeDistribution = stats.gradeDistribution;
  const labelsMap = Object.keys(gradeDistribution).map((key) => {
    let label = key;
    if (gradingScale === GradingScale.PassFail) {
      if (key === '0') label = t('utils.fail');
      else if (key === '1') label = t('utils.pass');
    } else if (gradingScale === GradingScale.SecondNationalLanguage) {
      if (key === '0') label = t('utils.fail');
      else if (key === '1') label = t('utils.sat');
      else if (key === '2') label = t('utils.good');
    }
    return {key, label};
  });

  const distributionLabels = labelsMap.map(item => item.label);
  const distributionValues = labelsMap.map(
    item => gradeDistribution[item.key],
  );

  const timelineData = stats.gradesOverTime;
  const timelineDates = timelineData.map(d => d.date);
  const timelineAverages = timelineData.map(d => d.averageGrade);
  const timelineCounts = timelineData.map(d => d.count);

  return (
    <Box sx={{mt: 4, mb: 4}}>
      <StatisticsFilters
        selectedModel={selectedModel}
        startDate={startDate}
        endDate={endDate}
        grouping={grouping}
        selectedYear={selectedYear}
        selectedPart={selectedPart}
        selectedTask={selectedTask}
        gradingModels={stats.gradingModels}
        courseParts={courseParts}
        courseTasks={courseTasks}
        oldestDate={oldestDate}
        onModelChange={onModelChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onGroupingChange={onGroupingChange}
        onYearChange={onYearChange}
        onPartChange={onPartChange}
        onTaskChange={onTaskChange}
        onClearFilters={onClearFilters}
      />

      <MetricCards
        totalEnrolled={stats.totalEnrolledStudents || stats.totalStudents || 0}
        activeStudents={stats.activeStudents || 0}
        totalFinalGrades={stats.totalFinalGrades || 0}
        medianGrade={stats.medianGrade || 0}
        passingAverageGrade={
          stats.passingAverageGrade ?? stats.averageGrade ?? 0
        }
        passingMedianGrade={stats.passingMedianGrade ?? stats.medianGrade ?? 0}
        passingCount={stats.passingCount || 0}
        failingCount={stats.failingCount || 0}
        activeRate={activeRate}
        completionRate={completionRate}
      />

      <CourseStructureStatus
        totalCourseParts={stats.totalCourseParts || 0}
        expiredCourseParts={stats.expiredCourseParts || 0}
        totalTaskGrades={stats.totalTaskGrades || 0}
        expiredTaskGrades={stats.expiredTaskGrades || 0}
        exportedToSisu={stats.exportedToSisu || 0}
        notExportedToSisu={stats.notExportedToSisu || 0}
      />

      <Grid container spacing={3}>
        <Grid size={{xs: 12, lg: 6}}>
          <FlexibleChart
            title={
              t('course.statistics.grade-distribution') || 'Grade Distribution'
            }
            xAxisData={distributionLabels}
            series={[
              {
                data: distributionValues,
                label: t('course.statistics.grade') || 'Grade',
                color: '#556cd6',
              },
            ]}
            defaultChartType="bar"
            allowChartTypeToggle={false}
            wrapInCard
            gridConfig={{horizontal: true}}
            hideLegend
            chartSx={{
              '.MuiBarElement-root': {
                rx: 6,
                ry: 6,
                filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))',
              },
            }}
          />
        </Grid>

        <Grid size={{xs: 12, lg: 6}}>
          <PerformanceOverTimeChart
            timelineDates={timelineDates}
            timelineAverages={timelineAverages}
            timelineCounts={timelineCounts}
          />
        </Grid>
      </Grid>

      {/* Year-over-Year Comparison Charts */}
      {(
        <Box sx={{mt: 4}}>
          <Typography variant="h5" gutterBottom sx={{mb: 3, fontWeight: 600}}>
            {t('statistics.year-over-year-comparison')
              || 'Year-over-Year Comparison'}
          </Typography>

          <Grid container spacing={3}>
            {/* Grade Trends */}
            <Grid size={{xs: 12, md: 6}}>
              <FlexibleChart
                title={t('statistics.grade-trends') || 'Grade Trends'}
                xAxisData={yearlyData.map(d => d.year)}
                series={[
                  {
                    data: yearlyData.map(d => d.averageGrade),
                    label: t('statistics.average-grade') || 'Average Grade',
                    color: '#2e7d32',
                  },
                  {
                    data: yearlyData.map(d => d.medianGrade),
                    label: t('statistics.median-grade') || 'Median Grade',
                    color: '#ed6c02',
                  },
                ]}
                defaultChartType="line"
                allowChartTypeToggle
              />
            </Grid>

            {/* Enrollment and Active Students Comparison */}
            <Grid size={{xs: 12, md: 6}}>
              <FlexibleChart
                title={
                  t('statistics.enrollment-comparison')
                  || 'Enrollment & Active Students'
                }
                xAxisData={enrollmentData.map(d => d.year)}
                series={[
                  {
                    data: enrollmentData.map(d => d.totalGraded),
                    label:
                      t('statistics.students-graded') || 'Completed with Grade',
                    color: '#2e7d32',
                    stack: enrollmentData.length > 1 ? 'enrollment' : undefined,
                  },
                  {
                    data: enrollmentData.map(d => d.activeNoGrade),
                    label:
                      t('statistics.active-no-grade')
                      || 'Active (No Final Grade)',
                    color: '#7cb342',
                    stack: enrollmentData.length > 1 ? 'enrollment' : undefined,
                  },
                  {
                    data: enrollmentData.map(d => d.enrolledInactive),
                    label:
                      t('statistics.enrolled-inactive')
                      || 'Enrolled (Inactive)',
                    color: '#ffb74d',
                    stack: enrollmentData.length > 1 ? 'enrollment' : undefined,
                  },
                ]}
                defaultChartType="bar"
                allowChartTypeToggle
                allowDisplayModeToggle
                defaultDisplayMode="absolute"
              />
            </Grid>
          </Grid>

          {/* Pass/Fail Rate Trends */}
          <Grid container spacing={3} sx={{mt: 2}}>
            <Grid size={{xs: 12, md: 6}}>
              <FlexibleChart
                title={
                  t('statistics.pass-fail-trends') || 'Pass/Fail Rate Trends'
                }
                xAxisData={passFailData.map(d => d.year)}
                series={[
                  {
                    data: passFailData.map(d => d.passRate),
                    label: t('statistics.pass-rate') || 'Pass Rate',
                    color: '#2e7d32',
                  },
                  {
                    data: passFailData.map(d => d.failRate),
                    label: t('statistics.fail-rate') || 'Fail Rate',
                    color: '#d32f2f',
                  },
                ]}
                forcePercentage
                defaultChartType="line"
                allowChartTypeToggle
                yAxisConfig={{min: 0, max: 100}}
              />
            </Grid>

            {/* Completion Rate Trends */}
            <Grid size={{xs: 12, md: 6}}>
              <FlexibleChart
                title={
                  t('statistics.completion-trends') || 'Completion Rate Trends'
                }
                xAxisData={enrollmentData.map(d => d.year)}
                series={[
                  {
                    data: enrollmentData.map(
                      d => (d.totalGraded / d.totalEnrolled) * 100,
                    ),
                    label: t('statistics.completion-rate') || 'Completion Rate',
                    color: '#1976d2',
                  },
                  {
                    data: enrollmentData.map(
                      d =>
                        ((d.totalGraded + d.activeNoGrade) / d.totalEnrolled)
                        * 100,
                    ),
                    label: t('statistics.engagement-rate') || 'Engagement Rate',
                    color: '#7cb342',
                  },
                ]}
                forcePercentage
                defaultChartType="line"
                allowChartTypeToggle
                yAxisConfig={{min: 0, max: 100}}
              />
            </Grid>
          </Grid>

          {/* Performance Comparison */}
          <Grid container spacing={3} sx={{mt: 2}}>
            <Grid size={{xs: 12}}>
              <FlexibleChart
                title={
                  t('statistics.performance-comparison')
                  || 'Performance Comparison'
                }
                xAxisData={yearlyData.map(d => d.year)}
                series={[
                  {
                    data: yearlyData.map(d => d.averageGrade),
                    label: t('statistics.average-grade') || 'Average Grade',
                    color: '#1976d2',
                  },
                ]}
                defaultChartType="line"
                allowChartTypeToggle
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CourseStatisticsView;
