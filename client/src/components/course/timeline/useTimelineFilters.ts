// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {SelectChangeEvent} from '@mui/material';
import {useMemo, useState} from 'react';

import type {CourseTaskData, GradingModelData, StudentRow} from '@/common/types';

interface UseTimelineFiltersProps {
  gradingModels: GradingModelData[] | undefined;
  courseTasks: CourseTaskData[] | undefined;
  gradesData: StudentRow[] | undefined;
}

interface UseTimelineFiltersResult {
  selectedGradingModelIds: number[];
  selectedTaskIds: number[];
  sisuFilter: 'all' | 'exported' | 'not-exported';
  setSisuFilter: (value: 'all' | 'exported' | 'not-exported') => void;
  groupBy: string[];
  search: string;
  setSearch: (value: string) => void;
  effectiveSelectedTaskIds: number[];
  visibleTasks: {id: number; name: string}[];
  handleGradingModelFilterChange: (event: SelectChangeEvent<number[]>) => void;
  handleTaskFilterChange: (event: SelectChangeEvent<number[]>) => void;
  handleGroupByChange: (event: SelectChangeEvent<string[]>) => void;
}

export const useTimelineFilters = ({
  gradingModels,
  courseTasks,
  gradesData,
}: UseTimelineFiltersProps): UseTimelineFiltersResult => {
  const [selectedGradingModelIds, setSelectedGradingModelIds] = useState<number[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [sisuFilter, setSisuFilter] = useState<'all' | 'exported' | 'not-exported'>('all');
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const tasksByModel = useMemo(() => {
    const map = new Map<number, Set<number>>();
    if (!gradingModels || !courseTasks) return map;

    gradingModels.forEach((model) => {
      const taskIds = new Set<number>();
      if (model.coursePartId !== null) {
        model.graphStructure.nodes.forEach((node) => {
          if (node.type === 'source') {
            const idParts = node.id.split('-');
            if (idParts.length > 1) {
              const id = parseInt(idParts[1]);
              if (!isNaN(id)) taskIds.add(id);
            }
          }
        });
      } else {
        const partIds = new Set<number>();
        model.graphStructure.nodes.forEach((node) => {
          if (node.type === 'source') {
            const idParts = node.id.split('-');
            if (idParts.length > 1) {
              const id = parseInt(idParts[1]);
              if (!isNaN(id)) partIds.add(id);
            }
          }
        });

        courseTasks.forEach((task) => {
          if (partIds.has(task.coursePartId)) {
            taskIds.add(task.id);
          }
        });
      }
      map.set(model.id, taskIds);
    });
    return map;
  }, [gradingModels, courseTasks]);

  const availableTaskIds = useMemo(() => {
    const ids = new Set<number>();
    if (selectedGradingModelIds.length === 0) {
      tasksByModel.forEach(tasks => tasks.forEach(taskId => ids.add(taskId)));
      return ids;
    }

    selectedGradingModelIds.forEach((modelId) => {
      const tasks = tasksByModel.get(modelId);
      if (tasks) {
        tasks.forEach(taskId => ids.add(taskId));
      }
    });
    return ids;
  }, [selectedGradingModelIds, tasksByModel]);

  const effectiveSelectedTaskIds = useMemo(() => {
    if (selectedTaskIds.length === 0) return Array.from(availableTaskIds);
    return selectedTaskIds.filter(id => availableTaskIds.has(id));
  }, [selectedTaskIds, availableTaskIds]);

  const allTasks = useMemo(() => {
    if (!gradesData) return [];
    const tasks = new Map<number, string>();
    gradesData.forEach((row) => {
      row.courseTasks.forEach((task) => {
        if (task.grades.length > 0) {
          tasks.set(task.courseTaskId, task.courseTaskName);
        }
      });
    });
    return Array.from(tasks.entries())
      .map(([id, name]) => ({id, name}))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [gradesData]);

  const visibleTasks = useMemo(() =>
    allTasks.filter(task => availableTaskIds.has(task.id)),
  [allTasks, availableTaskIds]
  );

  const handleGradingModelFilterChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',').map(Number) : value;
    setSelectedGradingModelIds(val);
  };

  const handleTaskFilterChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',').map(Number) : value;
    setSelectedTaskIds(val);
  };

  const handleGroupByChange = (event: SelectChangeEvent<string[]>): void => {
    const {
      target: {value},
    } = event;
    setGroupBy(typeof value === 'string' ? value.split(',') : value);
  };

  return {
    selectedGradingModelIds,
    selectedTaskIds,
    sisuFilter,
    setSisuFilter,
    groupBy,
    search,
    setSearch,
    effectiveSelectedTaskIds,
    visibleTasks,
    handleGradingModelFilterChange,
    handleTaskFilterChange,
    handleGroupByChange,
  };
};
