// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export interface YearlyStatistic {
  year: number | string;
  totalStudents: number;
  totalEnrolled: number;
  averageGrade: number;
  medianGrade: number;
  gradeDistribution: Record<string, number>;
  passingCount: number;
  failingCount: number;
  passRate: number;
  completionRate: number;
}

export interface GlobalStatistics {
  // Overall metrics
  totalStudents: number;
  totalEnrolled: number;
  averageGrade: number;
  medianGrade: number;

  // Performance indicators
  passingCount: number;
  failingCount: number;
  passRate: number;
  completionRate: number;

  // System overview
  totalActiveCourses: number;

  // Time-series data
  yearlyStatistics: YearlyStatistic[];

  // Per-course breakdown
  courseStatistics?: {
    courseId: number;
    courseCode: string;
    courseName: {fi: string; en: string; sv: string};
    yearlyStatistics: YearlyStatistic[];
  }[];
}

export interface GradingModelStatistic {
  id: number;
  name: string;
  count: number;
  averageGrade: number;
  gradeDistribution: Record<string, number>;
}

export interface TaskStatistic {
  id: number;
  name: string;
  submissionCount: number;
  averageGrade: number;
}

export interface CourseStatistics {
  averageGrade: number;
  gradeDistribution: Record<string, number>;
  totalStudents: number;
  totalEnrolledStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalAssistants: number;
  maxCredits: number;

  // Course parts expiration
  totalCourseParts: number;
  expiredCourseParts: number;

  // User grades expiration
  totalTaskGrades: number;
  expiredTaskGrades: number;

  // Sisu export status
  totalFinalGrades: number;
  exportedToSisu: number;
  notExportedToSisu: number;

  // More detailed stats
  passingCount: number;
  failingCount: number;
  medianGrade: number;
  passingAverageGrade: number;
  passingMedianGrade: number;

  // Usage by model
  gradingModels: GradingModelStatistic[];

  // Task statistics
  taskStatistics: TaskStatistic[];

  // Grades over time
  gradesOverTime: {
    date: string;
    averageGrade: number;
    count: number;
  }[];
}
