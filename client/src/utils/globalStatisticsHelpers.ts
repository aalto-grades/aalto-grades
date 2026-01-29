// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {GlobalStatistics} from '@/common/types';
import {calculateMedian} from './statisticsHelpers';

/**
 * Grade color mapping for consistent visualization
 */
export const GRADE_COLORS: Record<string, string> = {
  0: '#d32f2f',
  1: '#f57c00',
  2: '#fbc02d',
  3: '#afb42b',
  4: '#7cb342',
  5: '#388e3c',
} as const;

interface YearlyStatistic {
  totalStudents: number;
  totalEnrolled: number;
  gradeDistribution: Record<string, number>;
}

/**
 * Aggregates yearly statistics into a single summary
 */
export const aggregateYearlyStats = (
  yearlyStatistics: YearlyStatistic[],
): {
  totalStudents: number;
  totalEnrolled: number;
  gradeDistribution: Record<string, number>;
} => {
  return yearlyStatistics.reduce(
    (acc, curr) => {
      acc.totalStudents += curr.totalStudents;
      acc.totalEnrolled += curr.totalEnrolled || 0;
      // Merge grade distributions
      Object.entries(curr.gradeDistribution).forEach(([grade, count]) => {
        acc.gradeDistribution[grade] =
          (acc.gradeDistribution[grade] || 0) + count;
      });
      return acc;
    },
    {
      totalStudents: 0,
      totalEnrolled: 0,
      gradeDistribution: {} as Record<string, number>,
    },
  );
};

/**
 * Calculates average and median grades from a grade distribution
 */
export const calculateGradeMetrics = (
  gradeDistribution: Record<string, number>,
): {
  averageGrade: number;
  medianGrade: number;
} => {
  let totalScore = 0;
  let totalCount = 0;
  const allGrades: number[] = [];

  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    const val = Number(grade);
    if (!Number.isNaN(val)) {
      totalScore += val * count;
      totalCount += count;
      for (let i = 0; i < count; i++) {
        allGrades.push(val);
      }
    }
  });

  return {
    averageGrade: totalCount > 0 ? totalScore / totalCount : 0,
    medianGrade: calculateMedian(allGrades),
  };
};

/**
 * Calculates pass rate and completion rate from aggregated stats
 */
export const calculateRates = (aggregated: {
  totalStudents: number;
  totalEnrolled: number;
  gradeDistribution: Record<string, number>;
}): {
  passRate: number;
  completionRate: number;
} => {
  const totalGraded = aggregated.totalStudents;
  const failed = aggregated.gradeDistribution['0'] || 0;
  const passRate =
    totalGraded > 0 ? ((totalGraded - failed) / totalGraded) * 100 : 0;
  const completionRate =
    aggregated.totalEnrolled > 0
      ? (totalGraded / aggregated.totalEnrolled) * 100
      : 0;

  return {passRate, completionRate};
};

/**
 * Generates chart series for success metrics (pass rate and completion rate)
 */
export const generateSuccessMetricsSeries = (
  stats: GlobalStatistics,
  grouping: string,
  t: (key: string) => string,
): {data: number[]; label: string; color: string}[] => {
  if (grouping === 'COURSE' && stats.courseStatistics) {
    return [
      {
        data: stats.courseStatistics.map((course) => {
          const aggregated = course.yearlyStatistics.reduce(
            (sum, stat) => sum + stat.passRate * stat.totalStudents,
            0,
          );
          const totalStudents = course.yearlyStatistics.reduce(
            (sum, stat) => sum + stat.totalStudents,
            0,
          );
          return totalStudents > 0 ? aggregated / totalStudents : 0;
        }),
        label: t('statistics.pass-rate'),
        color: '#2e7d32',
      },
      {
        data: stats.courseStatistics.map((course) => {
          const aggregated = course.yearlyStatistics.reduce(
            (sum, stat) => sum + stat.completionRate * stat.totalEnrolled,
            0,
          );
          const totalEnrolled = course.yearlyStatistics.reduce(
            (sum, stat) => sum + stat.totalEnrolled,
            0,
          );
          return totalEnrolled > 0 ? aggregated / totalEnrolled : 0;
        }),
        label: t('statistics.completion-rate'),
        color: '#1976d2',
      },
    ];
  }

  return [
    {
      data: stats.yearlyStatistics.map(s => s.passRate).reverse(),
      label: t('statistics.pass-rate'),
      color: '#2e7d32',
    },
    {
      data: stats.yearlyStatistics.map(s => s.completionRate).reverse(),
      label: t('statistics.completion-rate'),
      color: '#1976d2',
    },
  ];
};

/**
 * Generates chart series for student count (graded + enrolled with no grade)
 */
export const generateStudentCountSeries = (
  stats: GlobalStatistics,
  grouping: string,
  t: (key: string) => string,
): {data: number[]; label: string; color: string; stack: string}[] => {
  if (grouping === 'COURSE' && stats.courseStatistics) {
    return [
      {
        data: stats.courseStatistics.map(c =>
          c.yearlyStatistics.reduce((sum, s) => sum + s.totalStudents, 0),
        ),
        label: t('statistics.total-graded'),
        color: '#ed6c02',
        stack: 'enrollment',
      },
      {
        data: stats.courseStatistics.map(c =>
          Math.max(
            0,
            c.yearlyStatistics.reduce(
              (sum, s) => sum + (s.totalEnrolled || s.totalStudents),
              0,
            )
            - c.yearlyStatistics.reduce((sum, s) => sum + s.totalStudents, 0),
          ),
        ),
        label: t('statistics.enrolled-no-grade'),
        color: '#ffcc80',
        stack: 'enrollment',
      },
    ];
  }

  return [
    {
      data: stats.yearlyStatistics.map(s => s.totalStudents).reverse(),
      label: t('statistics.total-graded'),
      color: '#ed6c02',
      stack: 'enrollment',
    },
    {
      data: stats.yearlyStatistics
        .map(s => Math.max(0, (s.totalEnrolled || s.totalStudents) - s.totalStudents))
        .reverse(),
      label: t('statistics.enrolled-no-grade'),
      color: '#ffcc80',
      stack: 'enrollment',
    },
  ];
};

/**
 * Generates chart series for grade distribution (stacked by grade 0-5)
 */
export const generateGradeDistributionSeries = (
  stats: GlobalStatistics,
  grouping: string,
  t: (key: string) => string,
): {data: number[]; label: string; stack: string; color: string}[] => {
  return ['0', '1', '2', '3', '4', '5'].map((grade) => {
    return {
      data:
        grouping === 'COURSE' && stats.courseStatistics
          ? stats.courseStatistics.map(c =>
              c.yearlyStatistics.reduce(
                (sum, s) => sum + (s.gradeDistribution[grade] || 0),
                0,
              ),
            )
          : stats.yearlyStatistics
              .map(s => s.gradeDistribution[grade] || 0)
              .reverse(),
      label: `${t('statistics.grade')} ${grade}`,
      stack: 'total',
      color: GRADE_COLORS[grade],
    };
  });
};

/**
 * Generates chart series for grade trends (average and median)
 */
export const generateGradeTrendsSeries = (
  stats: GlobalStatistics,
  grouping: string,
  t: (key: string) => string,
): {data: number[]; label: string; color: string}[] => {
  if (grouping === 'COURSE' && stats.courseStatistics) {
    return [
      {
        data: stats.courseStatistics.map((course) => {
          const totalGrades = course.yearlyStatistics.reduce(
            (sum, s) =>
              sum
              + Object.entries(s.gradeDistribution).reduce(
                (gradeSum, [grade, count]) => gradeSum + Number(grade) * count,
                0,
              ),
            0,
          );
          const totalCount = course.yearlyStatistics.reduce(
            (sum, s) =>
              sum
              + Object.values(s.gradeDistribution).reduce((a, b) => a + b, 0),
            0,
          );
          return totalCount > 0 ? totalGrades / totalCount : 0;
        }),
        label: t('statistics.average-grade'),
        color: '#2e7d32',
      },
      {
        data: stats.courseStatistics.map((course) => {
          const allGrades: number[] = [];
          course.yearlyStatistics.forEach((s) => {
            Object.entries(s.gradeDistribution).forEach(([grade, count]) => {
              for (let i = 0; i < count; i++) {
                allGrades.push(Number(grade));
              }
            });
          });
          return calculateMedian(allGrades);
        }),
        label: t('statistics.median-grade'),
        color: '#ed6c02',
      },
    ];
  }

  return [
    {
      data: stats.yearlyStatistics.map(s => s.averageGrade).reverse(),
      label: t('statistics.average-grade'),
      color: '#2e7d32',
    },
    {
      data: stats.yearlyStatistics.map(s => s.medianGrade).reverse(),
      label: t('statistics.median-grade'),
      color: '#ed6c02',
    },
  ];
};
