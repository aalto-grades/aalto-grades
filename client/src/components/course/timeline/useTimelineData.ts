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
  taskName: string;
};

export const useTimelineData = (
  gradesData: StudentRow[] | undefined,
  sisuFilter: 'all' | 'exported' | 'not-exported',
  expandedGroups: Set<string>,
  search: string,
  groupBy: 'task' | 'date',
  selectedTaskIds: number[]
): {groups: TimelineGroup[]; items: TimelineItem[]; minDate: number | null; itemsByGroup: Record<string, TimelineItem[] | undefined>} => {
  const {t} = useTranslation();

  return useMemo(() => {
    if (!gradesData) return {groups: [], items: [], minDate: null, itemsByGroup: {}};

    const groupsList: TimelineGroup[] = [];
    const itemsList: TimelineItem[] = [];
    const itemsByGroup: Record<string, TimelineItem[] | undefined> = {};
    let globalMinStart: number | null = null;
    const searchLower = search.toLowerCase();

    // Helper to process grades
    const allGrades: GradeEntry[] = [];
    gradesData.forEach((studentRow) => {
      const hasSisuExport = studentRow.finalGrades.some(fg => fg.sisuExportDate !== null);
      if (sisuFilter === 'exported' && !hasSisuExport) return;
      if (sisuFilter === 'not-exported' && hasSisuExport) return;

      const studentLabel = `${studentRow.user.studentNumber} (${studentRow.user.name ?? t('course.timeline.unknown')})`;

      studentRow.courseTasks.forEach((courseTask) => {
        if (selectedTaskIds.length > 0 && !selectedTaskIds.includes(courseTask.courseTaskId)) return;

        courseTask.grades.forEach((grade) => {
          allGrades.push({
            grade,
            studentName: studentLabel,
            studentId: studentRow.user.id,
            taskName: courseTask.courseTaskName,
          });
        });
      });
    });

    if (groupBy === 'task') {
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
          if (selectedTaskIds.length > 0 && !selectedTaskIds.includes(courseTask.courseTaskId)) return;

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
              taskName: courseTask.courseTaskName,
            });
          });
        });
      });

      const sortedTaskIds = Array.from(tasksMap.keys()).sort((a, b) => a - b);

      sortedTaskIds.forEach((taskId) => {
        const {taskName, grades} = tasksMap.get(taskId)!;

        if (grades.length === 0) return;

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

          if (globalMinStart === null || minStart < globalMinStart) {
            globalMinStart = minStart;
          }

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

          const item = {
            id: -taskId,
            groupId: taskGroupId,
            title: `${taskName} (${matchingGrades.length})`,
            start: minStart,
            end: endTimeVal,
            expiryDate: hasForever || !maxExpiryDayjs ? null : dayjs(maxExpiryDayjs).toDate(),
            isSummary: true,
            relatedGradeIds: matchingGrades.map(g => g.grade.id),
            hasForever,
          };
          itemsList.push(item);
          const taskGroupItems = itemsByGroup[taskGroupId] ?? [];
          taskGroupItems.push(item);
          itemsByGroup[taskGroupId] = taskGroupItems;
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
              const item: TimelineItem = {
                id: grade.id,
                groupId: studentGroupId,
                title: `${studentName} - ${grade.grade}`,
                start: dayjs(grade.date).valueOf(),
                end: expiryDayjs ? expiryDayjs.valueOf() : dayjs().add(20, 'months').valueOf(),
                gradeId: grade.id,
                studentName: studentName,
                expiryDate: grade.expiryDate,
                hasForever: !grade.expiryDate,
              };
              itemsList.push(item);
              const groupItems = itemsByGroup[studentGroupId] ?? [];
              groupItems.push(item);
              itemsByGroup[studentGroupId] = groupItems;
            }
          });
        }
      });
    } else {
      // Group by Date
      const dateMap = new Map<string, GradeEntry[]>();
      const NO_EXPIRY_KEY = 'no-expiry';

      gradesData.forEach((studentRow) => {
        const hasSisuExport = studentRow.finalGrades.some(fg => fg.sisuExportDate !== null);
        if (sisuFilter === 'exported' && !hasSisuExport) return;
        if (sisuFilter === 'not-exported' && hasSisuExport) return;

        const studentLabel = `${studentRow.user.studentNumber} (${studentRow.user.name ?? t('course.timeline.unknown')})`;

        studentRow.courseTasks.forEach((courseTask) => {
          if (selectedTaskIds.length > 0 && !selectedTaskIds.includes(courseTask.courseTaskId)) return;

          courseTask.grades.forEach((grade) => {
            const key = grade.expiryDate ? dayjs(grade.expiryDate).format('YYYY-MM-DD') : NO_EXPIRY_KEY;
            if (!dateMap.has(key)) dateMap.set(key, []);
            dateMap.get(key)!.push({
              grade,
              studentName: studentLabel,
              studentId: studentRow.user.id,
              taskName: courseTask.courseTaskName,
            });
          });
        });
      });

      const sortedDateKeys = Array.from(dateMap.keys()).sort((a, b) => {
        if (a === NO_EXPIRY_KEY) return 1;
        if (b === NO_EXPIRY_KEY) return -1;
        return a.localeCompare(b);
      });

      sortedDateKeys.forEach((dateKey) => {
        const grades = dateMap.get(dateKey)!;
        const dateGroupId = `date-${dateKey}`;
        const isExpanded = expandedGroups.has(dateGroupId);
        const groupTitle = dateKey === NO_EXPIRY_KEY ? t('course.timeline.no-expiry') : dayjs(dateKey).format('DD.MM.YYYY');

        let matchingGrades = grades;
        if (search) {
          matchingGrades = grades.filter(g =>
            g.taskName.toLowerCase().includes(searchLower)
            || g.studentName.toLowerCase().includes(searchLower)
          );
        }

        if (search && matchingGrades.length === 0) return;

        groupsList.push({
          id: dateGroupId,
          title: groupTitle,
          isRoot: true,
          expanded: isExpanded,
        });

        if (matchingGrades.length > 0) {
          const minStart = matchingGrades.reduce((min, {grade}) => {
            const start = dayjs(grade.date).valueOf();
            return start < min ? start : min;
          }, dayjs(matchingGrades[0].grade.date).valueOf());

          if (globalMinStart === null || minStart < globalMinStart) {
            globalMinStart = minStart;
          }

          const expiryDate = dateKey === NO_EXPIRY_KEY ? null : dayjs(dateKey).toDate();
          const endTimeVal = expiryDate
            ? dayjs(expiryDate).valueOf()
            : dayjs().add(20, 'months').valueOf();

          const item = {
            id: -dayjs(dateKey === NO_EXPIRY_KEY ? 0 : dateKey).valueOf(), // Pseudo ID
            groupId: dateGroupId,
            title: `${groupTitle} (${matchingGrades.length})`,
            start: minStart,
            end: endTimeVal,
            expiryDate: expiryDate,
            isSummary: true,
            relatedGradeIds: matchingGrades.map(g => g.grade.id),
            hasForever: dateKey === NO_EXPIRY_KEY,
          };
          itemsList.push(item);
          const groupItems = itemsByGroup[dateGroupId] ?? [];
          groupItems.push(item);
          itemsByGroup[dateGroupId] = groupItems;
        }

        if (isExpanded) {
          // Sort by task name then student name
          matchingGrades.sort((a, b) => {
            const taskCompare = a.taskName.localeCompare(b.taskName);
            if (taskCompare !== 0) return taskCompare;
            return a.studentName.localeCompare(b.studentName);
          });

          matchingGrades.forEach((entry) => {
            const {grade, studentName, taskName} = entry;
            const childGroupId = `${dateGroupId}-item-${grade.id}`;

            groupsList.push({
              id: childGroupId,
              title: `${taskName} - ${studentName}`,
              isRoot: false,
              parentId: dateGroupId,
            });

            const expiryDayjs = grade.expiryDate ? dayjs(grade.expiryDate) : null;
            const item: TimelineItem = {
              id: grade.id,
              groupId: childGroupId,
              title: `${taskName} - ${studentName} - ${grade.grade}`,
              start: dayjs(grade.date).valueOf(),
              end: expiryDayjs ? expiryDayjs.valueOf() : dayjs().add(20, 'months').valueOf(),
              gradeId: grade.id,
              studentName: studentName,
              expiryDate: grade.expiryDate,
              hasForever: !grade.expiryDate,
            };
            itemsList.push(item);
            const groupItems = itemsByGroup[childGroupId] ?? [];
            groupItems.push(item);
            itemsByGroup[childGroupId] = groupItems;
          });
        }
      });
    }

    return {groups: groupsList, items: itemsList, minDate: globalMinStart, itemsByGroup};
  }, [gradesData, sisuFilter, expandedGroups, t, search, groupBy, selectedTaskIds]);
};
