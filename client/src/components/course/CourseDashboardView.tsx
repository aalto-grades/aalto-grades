// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, CircularProgress, Grid} from '@mui/material';
import type {Dayjs} from 'dayjs';
import type {JSX} from 'react';
import {useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {CourseRoleType, GradingScale, SystemRole} from '@/common/types';
import {useGetCourseStatistics} from '@/hooks/api/statistics';
import {
  useGetAllGradingModels,
  useGetCourse,
  useGetCourseParts,
  useGetCourseTasks,
  useGetGrades,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {
  useGradeDistribution,
  useTaskGradeDistribution,
  useTaskSubmissions,
} from '@/hooks/useCourseMetrics';
import {getCourseRole} from '@/utils';
import {getDateRangeFromYear} from '@/utils/statisticsHelpers';
import CourseStatisticsView from './CourseStatisticsView';
import CourseInfoCard from './overview/CourseInfoCard';
import CourseStructureCard from './overview/CourseStructureCard';
import StudentEngagementCard from './overview/StudentEngagementCard';

type GroupingType = 'CALENDAR' | 'ACADEMIC' | 'CUSTOM';

const CourseDashboardView = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {auth} = useAuth();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [grouping, setGrouping] = useState<GroupingType>('ACADEMIC');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');

  // Calculate date range based on grouping type and selected year
  const {computedStartDate, computedEndDate} = useMemo(() => {
    const {startDate: calculatedStart, endDate: calculatedEnd} =
      getDateRangeFromYear(
        grouping,
        selectedYear,
        startDate?.toDate() ?? null,
        endDate?.toDate() ?? null,
      );
    return {
      computedStartDate: calculatedStart,
      computedEndDate: calculatedEnd,
    };
  }, [grouping, selectedYear, startDate, endDate]);

  const course = useGetCourse(courseId);
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const gradingModels = useGetAllGradingModels(courseId);

  const courseRole =
    course.data && auth
      ? getCourseRole(course.data, auth)
      : CourseRoleType.Student;
  const canViewStats =
    auth?.role === SystemRole.Admin
    || courseRole === CourseRoleType.Teacher
    || courseRole === CourseRoleType.Assistant;

  const grades = useGetGrades(courseId, {enabled: canViewStats});

  // Unfiltered statistics for dashboard overview cards
  const globalStatistics = useGetCourseStatistics(courseId, undefined, {
    enabled: canViewStats,
  });

  // All-time data for dashboard overview cards (unfiltered)
  const gradeDistribution = useGradeDistribution(grades.data, course.data);
  const taskSubmissions = useTaskSubmissions(
    globalStatistics.data?.taskStatistics,
  );
  const taskGradeDistribution = useTaskGradeDistribution(
    grades.data,
    globalStatistics.data?.taskStatistics,
    course.data?.gradingScale || GradingScale.Numerical,
  );

  const handleClearFilters = (): void => {
    setSelectedModel('');
    setStartDate(null);
    setEndDate(null);
    setGrouping('ACADEMIC');
    setSelectedYear('All');
    setSelectedPart('');
    setSelectedTask('');
  };

  if (!course.data) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} sx={{mb: 4, mt: 1}}>
        <Grid size={{xs: 12, md: 4}}>
          <CourseInfoCard
            course={course.data}
            gradingModels={gradingModels.data}
          />
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <CourseStructureCard
            courseParts={courseParts.data}
            courseTasks={courseTasks.data}
            totalTaskGrades={globalStatistics.data?.totalTaskGrades || 0}
            expiredTaskGrades={globalStatistics.data?.expiredTaskGrades || 0}
            expiredCourseParts={globalStatistics.data?.expiredCourseParts || 0}
            totalEnrolledStudents={
              globalStatistics.data?.totalEnrolledStudents || 0
            }
            activeStudents={globalStatistics.data?.activeStudents || 0}
          />
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <StudentEngagementCard
            totalFinalGrades={globalStatistics.data?.totalFinalGrades || 0}
            passingCount={globalStatistics.data?.passingCount || 0}
            failingCount={globalStatistics.data?.failingCount || 0}
            exportedToSisu={globalStatistics.data?.exportedToSisu || 0}
            notExportedToSisu={globalStatistics.data?.notExportedToSisu || 0}
            gradeDistribution={gradeDistribution}
            taskSubmissions={taskSubmissions}
            taskGradeDistribution={taskGradeDistribution}
            canViewStats={canViewStats}
          />
        </Grid>
      </Grid>

      <CourseStatisticsView
        computedStartDate={computedStartDate}
        computedEndDate={computedEndDate}
        startDate={startDate}
        endDate={endDate}
        selectedModel={selectedModel}
        grouping={grouping}
        selectedYear={selectedYear}
        selectedPart={selectedPart}
        selectedTask={selectedTask}
        courseParts={courseParts.data || []}
        courseTasks={courseTasks.data || []}
        gradingScale={course.data.gradingScale}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onModelChange={setSelectedModel}
        onGroupingChange={setGrouping}
        onYearChange={setSelectedYear}
        onPartChange={setSelectedPart}
        onTaskChange={setSelectedTask}
        onClearFilters={handleClearFilters}
      />
    </Box>
  );
};

export default CourseDashboardView;
