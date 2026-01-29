// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {type CourseData, GradingScale, type StudentRow} from '@/common/types';
import {truncateTaskName} from '@/utils/statisticsHelpers';

interface GradeDistributionItem {
  label: string;
  value: number;
}

/**
 * Helper function to initialize grade distribution based on grading scale
 */
const initializeGradeDistribution = (gradingScale: GradingScale | undefined): Record<string, number> => {
  if (gradingScale === GradingScale.PassFail) {
    return {0: 0, 1: 0};
  } else if (gradingScale === GradingScale.SecondNationalLanguage) {
    return {0: 0, 1: 0, 2: 0};
  }
  return {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
};

/**
 * Helper function to get grade label based on grading scale
 */
const getGradeLabel = (
  key: string,
  gradingScale: GradingScale | undefined,
  t: (key: string) => string,
): string => {
  if (gradingScale === GradingScale.PassFail) {
    return key === '0' ? t('utils.fail') : t('utils.pass');
  }
  if (gradingScale === GradingScale.SecondNationalLanguage) {
    if (key === '0') return t('utils.fail');
    if (key === '1') return t('utils.sat');
    if (key === '2') return t('utils.good');
  }
  return key;
};

export const useGradeDistribution = (
  grades: StudentRow[] | undefined,
  course: CourseData | undefined,
): GradeDistributionItem[] => {
  const {t} = useTranslation();

  return useMemo(() => {
    const dist = initializeGradeDistribution(course?.gradingScale);

    if (grades) {
      for (const student of grades) {
        for (const fg of student.finalGrades) {
          const gradeKey = String(fg.grade);
          if (Object.hasOwn(dist, gradeKey)) {
            dist[gradeKey]++;
          }
        }
      }
    }

    return Object.entries(dist)
      .map(([key, value]) => ({
        label: getGradeLabel(key, course?.gradingScale, t),
        value,
        key,
      }))
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(({label, value}) => ({label, value}));
  }, [grades, course, t]);
};

interface TaskSubmissionItem {
  label: string;
  value: number;
}

export const useTaskSubmissions = (
  taskStatistics: Array<{id: number | string; name: string; submissionCount: number}> | undefined,
): TaskSubmissionItem[] => {
  return useMemo(() => {
    if (!taskStatistics) return [];

    return taskStatistics
      .toSorted((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 6)
      .map(task => ({
        label: truncateTaskName(task.name),
        value: task.submissionCount,
      }));
  }, [taskStatistics]);
};

interface TaskGradeDistributionItem {
  task: string;
  [key: string]: string | number;
}

export const useTaskGradeDistribution = (
  grades: StudentRow[] | undefined,
  taskStatistics: Array<{id: number | string; name: string; submissionCount: number}> | undefined,
  gradingScale: GradingScale,
): TaskGradeDistributionItem[] => {
  return useMemo(() => {
    if (!grades || !taskStatistics) return [];

    const topTasks = taskStatistics
      .toSorted((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 6);

    return topTasks.map((task) => {
      const gradesByTask = initializeGradeDistribution(gradingScale);

      for (const student of grades) {
        const courseTask = student.courseTasks.find(
          ct => ct.courseTaskId === task.id,
        );
        if (courseTask) {
          for (const grade of courseTask.grades) {
            const gradeKey = String(Math.round(grade.grade));
            if (Object.hasOwn(gradesByTask, gradeKey)) {
              gradesByTask[gradeKey]++;
            }
          }
        }
      }

      return {
        task: truncateTaskName(task.name),
        ...gradesByTask,
      };
    });
  }, [grades, taskStatistics, gradingScale]);
};
