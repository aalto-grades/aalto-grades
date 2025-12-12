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

export type SortBy = 'student' | 'task' | 'date' | 'expiry';
export type SortOrder = 'asc' | 'desc';

export const useTimelineData = (
  gradesData: StudentRow[] | undefined,
  sisuFilter: 'all' | 'exported' | 'not-exported',
  expandedGroups: Set<string>,
  search: string,
  groupBy: string[],
  selectedTaskIds: number[],
  sortBy: SortBy = 'task',
  sortOrder: SortOrder = 'asc'
): {groups: TimelineGroup[]; items: TimelineItem[]; minDate: number | null; itemsByGroup: Record<string, TimelineItem[] | undefined>} => {
  const {t} = useTranslation();

  return useMemo(() => {
    if (!gradesData) return {groups: [], items: [], minDate: null, itemsByGroup: {}};

    const groupsList: TimelineGroup[] = [];
    const itemsList: TimelineItem[] = [];
    const itemsByGroup: Record<string, TimelineItem[] | undefined> = {};
    let globalMinStart: number | null = null;
    const searchLower = search.toLowerCase();

    const groupedGrades = new Map<string, {
      grades: GradeEntry[];
      titleParts: string[];
      sortKey: string;
    }>();

    const NO_EXPIRY_KEY = 'no-expiry';

    gradesData.forEach((studentRow) => {
      const hasSisuExport = studentRow.finalGrades.some(fg => fg.sisuExportDate !== null);
      if (sisuFilter === 'exported' && !hasSisuExport) return;
      if (sisuFilter === 'not-exported' && hasSisuExport) return;

      const studentLabel = `${studentRow.user.studentNumber} (${studentRow.user.name ?? t('course.timeline.unknown')})`;

      studentRow.courseTasks.forEach((courseTask) => {
        if (selectedTaskIds.length > 0 && !selectedTaskIds.includes(courseTask.courseTaskId)) return;

        courseTask.grades.forEach((grade) => {
          const keyParts: string[] = [];
          const titleParts: string[] = [];
          const sortKeyParts: string[] = [];

          const useAll = groupBy.length === 0;
          const useStartDate = useAll || groupBy.includes('startDate');
          const useEndDate = useAll || groupBy.includes('endDate');
          const useGradingModel = useAll || groupBy.includes('gradingModel');

          if (useStartDate) {
            const dateStr = dayjs(grade.date).format('YYYY-MM-DD');
            keyParts.push(`start-${dateStr}`);
            titleParts.push(dayjs(grade.date).format('DD.MM.YYYY'));
            sortKeyParts.push(dateStr);
          }

          if (useEndDate) {
            const dateStr = grade.expiryDate ? dayjs(grade.expiryDate).format('YYYY-MM-DD') : NO_EXPIRY_KEY;
            keyParts.push(`end-${dateStr}`);
            titleParts.push(grade.expiryDate ? dayjs(grade.expiryDate).format('DD.MM.YYYY') : t('course.timeline.no-expiry'));
            sortKeyParts.push(dateStr === NO_EXPIRY_KEY ? '9999-99-99' : dateStr);
          }

          if (useGradingModel) {
            keyParts.push(`task-${courseTask.courseTaskId}`);
            titleParts.push(courseTask.courseTaskName);
            sortKeyParts.push(courseTask.courseTaskName);
          }

          if (keyParts.length === 0) {
            keyParts.push('all');
            titleParts.push(t('course.timeline.all-items') || 'All Items');
            sortKeyParts.push('all');
          }

          const groupKey = keyParts.join('|');

          if (!groupedGrades.has(groupKey)) {
            groupedGrades.set(groupKey, {
              grades: [],
              titleParts,
              sortKey: sortKeyParts.join('|')
            });
          }

          groupedGrades.get(groupKey)!.grades.push({
            grade,
            studentName: studentLabel,
            studentId: studentRow.user.id,
            taskName: courseTask.courseTaskName,
          });
        });
      });
    });

    const sortedGroupKeys = Array.from(groupedGrades.keys()).sort((a, b) => {
      const groupA = groupedGrades.get(a)!;
      const groupB = groupedGrades.get(b)!;

      // If sorting by student, keep groups in natural order (by sortKey)
      if (sortBy === 'student') {
        return groupA.sortKey.localeCompare(groupB.sortKey);
      }

      let comparison = 0;

      if (sortBy === 'task') {
        const taskA = groupA.grades[0].taskName;
        const taskB = groupB.grades[0].taskName;
        comparison = taskA.localeCompare(taskB);
      } else if (sortBy === 'date') {
        const dateA = dayjs(groupA.grades[0].grade.date).valueOf();
        const dateB = dayjs(groupB.grades[0].grade.date).valueOf();
        comparison = dateA - dateB;
      } else {
        // expiry
        type GradeItem = (typeof groupA.grades)[number];
        const getExp = (g: GradeItem): number => g.grade.expiryDate ? dayjs(g.grade.expiryDate).valueOf() : Number.MAX_SAFE_INTEGER;
        const expA = getExp(groupA.grades[0]);
        const expB = getExp(groupB.grades[0]);
        comparison = expA - expB;
      }

      if (comparison === 0) {
        comparison = groupA.sortKey.localeCompare(groupB.sortKey);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    sortedGroupKeys.forEach((groupKey, index) => {
      const {grades, titleParts} = groupedGrades.get(groupKey)!;
      const isExpanded = expandedGroups.has(groupKey);
      const groupTitle = titleParts.join(' - ');

      let matchingGrades = grades;
      if (search) {
        matchingGrades = grades.filter(g =>
          g.taskName.toLowerCase().includes(searchLower)
          || g.studentName.toLowerCase().includes(searchLower)
        );
      }

      if (search && matchingGrades.length === 0) return;

      groupsList.push({
        id: groupKey,
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
          id: -(index + 1),
          groupId: groupKey,
          title: `${groupTitle} (${matchingGrades.length})`,
          start: minStart,
          end: endTimeVal,
          expiryDate: hasForever || !maxExpiryDayjs ? null : dayjs(maxExpiryDayjs).toDate(),
          isSummary: true,
          relatedGradeIds: matchingGrades.map(g => g.grade.id),
          hasForever,
        };
        itemsList.push(item);
        const groupItems = itemsByGroup[groupKey] ?? [];
        groupItems.push(item);
        itemsByGroup[groupKey] = groupItems;
      }

      if (isExpanded) {
        matchingGrades.sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case 'student':
              comparison = a.studentName.localeCompare(b.studentName);
              break;
            case 'task':
              comparison = a.taskName.localeCompare(b.taskName);
              break;
            case 'date':
              comparison = dayjs(a.grade.date).valueOf() - dayjs(b.grade.date).valueOf();
              break;
            case 'expiry': {
              const aExp = a.grade.expiryDate ? dayjs(a.grade.expiryDate).valueOf() : Number.MAX_SAFE_INTEGER;
              const bExp = b.grade.expiryDate ? dayjs(b.grade.expiryDate).valueOf() : Number.MAX_SAFE_INTEGER;
              comparison = aExp - bExp;
              break;
            }
          }

          if (comparison === 0) {
            // Secondary sort by student name if not already sorting by it
            if (sortBy !== 'student') {
              comparison = a.studentName.localeCompare(b.studentName);
            }
            // Tertiary sort by task name
            if (comparison === 0 && sortBy !== 'task') {
              comparison = a.taskName.localeCompare(b.taskName);
            }
          }

          return sortOrder === 'asc' ? comparison : -comparison;
        });

        matchingGrades.forEach((entry) => {
          const {grade, studentName, taskName} = entry;
          const childGroupId = `${groupKey}-item-${grade.id}`;

          groupsList.push({
            id: childGroupId,
            title: `${taskName} - ${studentName}`,
            isRoot: false,
            parentId: groupKey,
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

    return {groups: groupsList, items: itemsList, minDate: globalMinStart, itemsByGroup};
  }, [gradesData, sisuFilter, expandedGroups, t, search, groupBy, selectedTaskIds, sortBy, sortOrder]);
};
