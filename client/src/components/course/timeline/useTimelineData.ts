// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import dayjs, {type Dayjs} from 'dayjs';
import {type ReactNode, useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import type {StudentRow, TaskGradeData} from '@/common/types';

export interface TimelineItem {
  id: number;
  groupId: string;
  title: string;
  start: number; // timestamp
  end: number; // timestamp
  expiryDate: Date | null;
  gradeId?: number;
  studentName?: string;
  isSummary?: boolean;
  relatedGradeIds?: number[];
  hasForever?: boolean;
}

export interface TimelineGroup {
  id: string;
  title: ReactNode;
  isRoot: boolean;
  parentId?: string;
  expanded?: boolean;
}

type GradeEntry = {
  grade: TaskGradeData;
  studentName: string;
  studentId: number;
};

export const useTimelineData = (
  gradesData: StudentRow[] | undefined,
  sisuFilter: 'all' | 'exported' | 'not-exported',
  expandedGroups: Set<string>,
  search: string
): {groups: TimelineGroup[]; items: TimelineItem[]} => {
  const {t} = useTranslation();

  return useMemo(() => {
    if (!gradesData) return {groups: [], items: []};

    const groupsList: TimelineGroup[] = [];
    const itemsList: TimelineItem[] = [];
    const now = dayjs();
    const searchLower = search.toLowerCase();

    const tasksMap = new Map<number, {
      taskName: string;
      grades: GradeEntry[];
    }>();

    gradesData.forEach((studentRow) => {
      const hasSisuExport = studentRow.finalGrades.some(fg => fg.sisuExportDate !== null);
      if (sisuFilter === 'exported' && !hasSisuExport) return;
      if (sisuFilter === 'not-exported' && hasSisuExport) return;

      const studentLabel = `${studentRow.user.studentNumber} (${studentRow.user.name ?? t('course.timeline.unknown')})`;

      studentRow.courseTasks.forEach((courseTask) => {
        if (!tasksMap.has(courseTask.courseTaskId)) {
          tasksMap.set(courseTask.courseTaskId, {
            taskName: courseTask.courseTaskName,
            grades: [],
          });
        }
        courseTask.grades.forEach((grade) => {
          tasksMap.get(courseTask.courseTaskId)!.grades.push({
            grade,
            studentName: studentLabel,
            studentId: studentRow.user.id,
          });
        });
      });
    });

    const sortedTaskIds = Array.from(tasksMap.keys()).sort((a, b) => a - b);

    sortedTaskIds.forEach((taskId) => {
      const {taskName, grades} = tasksMap.get(taskId)!;
      const taskGroupId = `task-${taskId}`;
      const isExpanded = expandedGroups.has(taskGroupId);

      const taskMatches = taskName.toLowerCase().includes(searchLower);
      let matchingGrades = grades;

      if (search) {
        if (taskMatches) {
          matchingGrades = grades;
        } else {
          matchingGrades = grades.filter(g => g.studentName.toLowerCase().includes(searchLower));
        }
      }

      if (search && !taskMatches && matchingGrades.length === 0) {
        return;
      }

      groupsList.push({
        id: taskGroupId,
        title: taskName,
        isRoot: true,
        expanded: isExpanded,
      });

      if (matchingGrades.length > 0) {
        const minStart = matchingGrades.reduce((min, {grade}) => {
          const start = dayjs(grade.date).valueOf();
          return start < min ? start : min;
        }, dayjs(matchingGrades[0].grade.date).valueOf());

        const maxExpiryDayjs = matchingGrades.reduce((max: Dayjs | null, {grade}) => {
          if (grade.expiryDate) {
            const exp = dayjs(grade.expiryDate);
            if (!max || exp.isAfter(max)) {
              return exp;
            }
          }
          return max;
        }, null);

        const hasForever = matchingGrades.some(({grade}) => !grade.expiryDate);

        const endTimeVal = hasForever || !maxExpiryDayjs
          ? dayjs().add(20, 'months').valueOf()
          : dayjs(maxExpiryDayjs).valueOf();

        const isExpired = !hasForever && maxExpiryDayjs
          ? dayjs(maxExpiryDayjs).isBefore(now)
          : false;

        if (!isExpired) {
          itemsList.push({
            id: -taskId,
            groupId: taskGroupId,
            title: `${taskName} (${t('course.timeline.all-students')})`,
            start: minStart,
            end: endTimeVal,
            expiryDate: hasForever || !maxExpiryDayjs ? null : dayjs(maxExpiryDayjs).toDate(),
            isSummary: true,
            relatedGradeIds: matchingGrades.map(g => g.grade.id),
            hasForever,
          });
        }
      }

      if (isExpanded) {
        const studentGradesMap = new Map<string, GradeEntry[]>();
        matchingGrades.forEach((g) => {
          const key = `${taskGroupId}-student-${g.studentId}`;
          if (!studentGradesMap.has(key)) studentGradesMap.set(key, []);
          studentGradesMap.get(key)!.push(g);
        });

        const sortedStudentKeys = Array.from(studentGradesMap.keys()).sort((a, b) => {
          const nameA = studentGradesMap.get(a)![0].studentName;
          const nameB = studentGradesMap.get(b)![0].studentName;
          return nameA.localeCompare(nameB);
        });

        sortedStudentKeys.forEach((studentGroupId) => {
          const sGrades = studentGradesMap.get(studentGroupId)!;
          groupsList.push({
            id: studentGroupId,
            title: sGrades[0].studentName,
            isRoot: false,
            parentId: taskGroupId,
          });

          sGrades.sort((a, b) => {
            if (a.grade.grade !== b.grade.grade) {
              return b.grade.grade - a.grade.grade;
            }
            return dayjs(b.grade.date).valueOf() - dayjs(a.grade.date).valueOf();
          });

          if (sGrades.length > 0) {
            const {grade, studentName} = sGrades[0];
            const expiryDayjs = grade.expiryDate ? dayjs(grade.expiryDate) : null;
            const isExpired = expiryDayjs ? expiryDayjs.isBefore(now) : false;

            if (!isExpired) {
              itemsList.push({
                id: grade.id,
                groupId: studentGroupId,
                title: `${studentName} - ${grade.grade}`,
                start: dayjs(grade.date).valueOf(),
                end: expiryDayjs ? expiryDayjs.valueOf() : dayjs().add(20, 'months').valueOf(),
                gradeId: grade.id,
                studentName: studentName,
                expiryDate: grade.expiryDate,
                hasForever: !grade.expiryDate,
              });
            }
          }
        });
      }
    });

    return {groups: groupsList, items: itemsList};
  }, [gradesData, sisuFilter, expandedGroups, t, search]);
};
