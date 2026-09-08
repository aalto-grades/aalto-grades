// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {
  FinalGradeFrozenInfo,
  FrozenTaskGrade,
  GraphStructure,
} from '@/common/types';
import {batchCalculateCourseParts} from '@/common/util';
import {findBestGrade} from '@/utils';

/** findBestGrade expects id and Date fields, the frozen grades have neither */
export const bestFrozenGrade = (grades: FrozenTaskGrade[]): number | null => {
  const best = findBestGrade(
    grades.map((grade, index) => ({
      id: index,
      grade: grade.grade,
      date: new Date(grade.date),
      expiryDate:
        grade.expiryDate === null ? null : new Date(grade.expiryDate),
    })),
    null,
    {expiredOption: 'any'}
  );
  return best?.grade ?? null;
};

/**
 * Source ids (tasks or course parts) referenced by a frozen graph structure.
 * Source nodes have ids of the form "source-<id>".
 */
export const frozenSourceIds = (graph: GraphStructure): Set<number> =>
  new Set(
    graph.nodes
      .filter(node => node.type === 'source')
      .map(node => parseInt(node.id.split('-')[1]))
  );

/**
 * Course part grade calculated from the frozen models of a final grade
 * snapshot.
 */
export const frozenPartGrade = (
  frozenInfo: FinalGradeFrozenInfo,
  partId: number
): number | null => {
  const partModels = frozenInfo.courseParts
    .filter(part => part.gradingModel !== null)
    .map(part => ({
      id: part.gradingModel!.id,
      courseId: 0,
      coursePartId: part.id,
      name: part.gradingModel!.name,
      graphStructure: part.gradingModel!.graphStructure,
      archived: false,
      hasExpiredSources: false,
      hasArchivedSources: false,
      hasDeletedSources: false,
    }));

  const courseTasks = frozenInfo.tasks.flatMap((task) => {
    const grade = bestFrozenGrade(task.grades);
    return grade === null ? [] : [{id: task.id, grade}];
  });

  const values = batchCalculateCourseParts(partModels, [
    {userId: 0, courseTasks},
  ]);
  return values[0][partId] ?? null;
};
