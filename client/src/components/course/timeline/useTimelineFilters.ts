// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {SelectChangeEvent} from '@mui/material';
import {useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import type {CourseTaskData, GradingModelData, StudentRow} from '@/common/types';

type SisuFilter = 'all' | 'exported' | 'not-exported';

interface UseTimelineFiltersProps {
  gradingModels: GradingModelData[] | undefined;
  courseTasks: CourseTaskData[] | undefined;
  gradesData: StudentRow[] | undefined;
}

interface UseTimelineFiltersResult {
  selectedGradingModelIds: number[];
  selectedCoursePartIds: number[];
  selectedTaskIds: number[];
  sisuFilter: SisuFilter;
  setSisuFilter: (value: SisuFilter) => void;
  groupBy: string[];
  search: string;
  setSearch: (value: string) => void;
  effectiveSelectedTaskIds: number[];
  visibleTasks: {id: number; name: string}[];
  pureGradingModels: GradingModelData[];
  coursePartModels: GradingModelData[];
  handleGradingModelFilterChange: (event: SelectChangeEvent<number[]>) => void;
  handleCoursePartFilterChange: (event: SelectChangeEvent<number[]>) => void;
  handleTaskFilterChange: (event: SelectChangeEvent<number[]>) => void;
  handleGroupByChange: (event: SelectChangeEvent<string[]>) => void;
}

export const useTimelineFilters = ({
  gradingModels,
  courseTasks,
  gradesData,
}: UseTimelineFiltersProps): UseTimelineFiltersResult => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGradingModelIds = useMemo(() => {
    const val = searchParams.get('models');
    return val ? val.split(',').map(Number) : [];
  }, [searchParams]);

  const selectedCoursePartIds = useMemo(() => {
    const val = searchParams.get('parts');
    return val ? val.split(',').map(Number) : [];
  }, [searchParams]);

  const selectedTaskIds = useMemo(() => {
    const val = searchParams.get('tasks');
    return val ? val.split(',').map(Number) : [];
  }, [searchParams]);

  const sisuParam = searchParams.get('sisu');
  const sisuFilter: SisuFilter =
    sisuParam === 'exported' || sisuParam === 'not-exported'
      ? sisuParam
      : 'all';

  const groupBy = useMemo(() => {
    const val = searchParams.get('group');
    return val ? val.split(',') : [];
  }, [searchParams]);

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  const {pureGradingModels, coursePartModels} = useMemo(() => {
    const pure: GradingModelData[] = [];
    const parts: GradingModelData[] = [];
    if (gradingModels) {
      gradingModels.forEach((m) => {
        if (m.coursePartId === null) pure.push(m);
        else parts.push(m);
      });
    }
    return {pureGradingModels: pure, coursePartModels: parts};
  }, [gradingModels]);

  const tasksByModel = useMemo(() => {
    const map = new Map<number, Set<number>>();
    if (!gradingModels || !courseTasks) return map;

    gradingModels.forEach((model) => {
      const taskIds = new Set<number>();
      if (model.coursePartId === null) {
        const partIds = new Set<number>();
        model.graphStructure.nodes.forEach((node) => {
          if (node.type === 'source') {
            const idParts = node.id.split('-');
            if (idParts.length > 1) {
              const id = Number.parseInt(idParts[1]);
              if (!Number.isNaN(id)) partIds.add(id);
            }
          }
        });

        courseTasks.forEach((task) => {
          if (partIds.has(task.coursePartId)) {
            taskIds.add(task.id);
          }
        });
      } else {
        model.graphStructure.nodes.forEach((node) => {
          if (node.type === 'source') {
            const idParts = node.id.split('-');
            if (idParts.length > 1) {
              const id = Number.parseInt(idParts[1]);
              if (!Number.isNaN(id)) taskIds.add(id);
            }
          }
        });
      }
      map.set(model.id, taskIds);
    });
    return map;
  }, [gradingModels, courseTasks]);

  const availableTaskIds = useMemo(() => {
    const ids = new Set<number>();
    if (
      selectedGradingModelIds.length === 0
      && selectedCoursePartIds.length === 0
    ) {
      tasksByModel.forEach(tasks => tasks.forEach(taskId => ids.add(taskId)));
    } else {
      selectedGradingModelIds.forEach((modelId) => {
        const tasks = tasksByModel.get(modelId);
        if (tasks) {
          tasks.forEach(taskId => ids.add(taskId));
        }
      });

      selectedCoursePartIds.forEach((modelId) => {
        const tasks = tasksByModel.get(modelId);
        if (tasks) {
          tasks.forEach(taskId => ids.add(taskId));
        }
      });
    }

    return ids;
  }, [selectedGradingModelIds, selectedCoursePartIds, tasksByModel]);

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

  const updateSearchParam = (key: string, value: string | null): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      {replace: true}
    );
  };

  const handleGradingModelFilterChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',').map(Number) : value;
    updateSearchParam('models', val.length > 0 ? val.join(',') : null);
  };

  const handleCoursePartFilterChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',').map(Number) : value;
    updateSearchParam('parts', val.length > 0 ? val.join(',') : null);
  };

  const handleTaskFilterChange = (event: SelectChangeEvent<number[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',').map(Number) : value;
    updateSearchParam('tasks', val.length > 0 ? val.join(',') : null);
  };

  const handleGroupByChange = (event: SelectChangeEvent<string[]>): void => {
    const {
      target: {value},
    } = event;
    const val = typeof value === 'string' ? value.split(',') : value;
    updateSearchParam('group', val.length > 0 ? val.join(',') : null);
  };

  const setSisuFilter = (value: SisuFilter): void => {
    updateSearchParam('sisu', value === 'all' ? null : value);
  };

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearch = (value: string): void => {
    setLocalSearch(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateSearchParam('search', value || null);
    }, 300);
  };

  return {
    selectedGradingModelIds,
    selectedCoursePartIds,
    selectedTaskIds,
    sisuFilter,
    setSisuFilter,
    groupBy,
    search: localSearch,
    setSearch,
    effectiveSelectedTaskIds,
    visibleTasks,
    pureGradingModels,
    coursePartModels,
    handleGradingModelFilterChange,
    handleCoursePartFilterChange,
    handleTaskFilterChange,
    handleGroupByChange,
  };
};
