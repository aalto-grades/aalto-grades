// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {GradingModelData} from '@/common/types';
import Search from '@/components/shared/Search';

interface TimelineToolbarProps {
  pxPerDay: number;
  setPxPerDay: (val: number) => void;
  minPxPerDay: number;
  maxPxPerDay: number;
  groupBy: string[];
  handleGroupByChange: (event: SelectChangeEvent<string[]>) => void;
  selectedGradingModelIds: number[];
  handleGradingModelFilterChange: (event: SelectChangeEvent<number[]>) => void;
  gradingModels: GradingModelData[] | undefined;
  selectedTaskIds: number[];
  handleTaskFilterChange: (event: SelectChangeEvent<number[]>) => void;
  visibleTasks: {id: number; name: string}[];
  sisuFilter: 'all' | 'exported' | 'not-exported';
  setSisuFilter: (val: 'all' | 'exported' | 'not-exported') => void;
  search: string;
  setSearch: (val: string) => void;
}

const TimelineToolbar = ({
  pxPerDay,
  setPxPerDay,
  minPxPerDay,
  maxPxPerDay,
  groupBy,
  handleGroupByChange,
  selectedGradingModelIds,
  handleGradingModelFilterChange,
  gradingModels,
  selectedTaskIds,
  handleTaskFilterChange,
  visibleTasks,
  sisuFilter,
  setSisuFilter,
  search,
  setSearch,
}: TimelineToolbarProps): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h2" width="fit-content">
        {t('course.timeline.title')}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center" sx={{width: 200}}>
          <ZoomOut color="action" fontSize="small" />
          <Slider
            value={pxPerDay}
            min={minPxPerDay}
            max={maxPxPerDay}
            step={0.5}
            onChange={(_, val) => setPxPerDay(val)}
            size="small"
          />
          <ZoomIn color="action" fontSize="small" />
        </Stack>

        <FormControl size="small" sx={{minWidth: 120}}>
          <InputLabel id="group-by-label" shrink>{t('course.timeline.group-by')}</InputLabel>
          <Select
            labelId="group-by-label"
            multiple
            displayEmpty
            value={groupBy}
            label={t('course.timeline.group-by')}
            onChange={handleGroupByChange}
            renderValue={(selected) => {
              if (selected.length === 0) return t('course.timeline.all-selected');
              return selected.map((s) => {
                if (s === 'startDate') return t('course.timeline.start-date');
                if (s === 'endDate') return t('course.timeline.end-date');
                if (s === 'gradingModel') return t('course.timeline.grading-model');
                return s;
              }).join(', ');
            }}
          >
            <MenuItem value="startDate">
              <Checkbox checked={groupBy.includes('startDate')} />
              <ListItemText primary={t('course.timeline.start-date')} />
            </MenuItem>
            <MenuItem value="endDate">
              <Checkbox checked={groupBy.includes('endDate')} />
              <ListItemText primary={t('course.timeline.end-date')} />
            </MenuItem>
            <MenuItem value="gradingModel">
              <Checkbox checked={groupBy.includes('gradingModel')} />
              <ListItemText primary={t('course.timeline.grading-model')} />
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{minWidth: 140, width: 'fit-content'}}>
          <InputLabel id="grading-model-filter-label" shrink>{t('course.timeline.filter-grading-models')}</InputLabel>
          <Select
            labelId="grading-model-filter-label"
            multiple
            displayEmpty
            value={selectedGradingModelIds}
            onChange={handleGradingModelFilterChange}
            input={<OutlinedInput label={t('course.timeline.filter-grading-models')} notched />}
            renderValue={(selected) => {
              if (selected.length === 0) return t('course.timeline.all-grading-models-selected');
              return t('course.timeline.selected-count', {count: selected.length});
            }}
          >
            {gradingModels?.map(model => (
              <MenuItem key={model.id} value={model.id}>
                <Checkbox checked={selectedGradingModelIds.includes(model.id)} />
                <ListItemText primary={model.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{minWidth: 140, width: 'fit-content'}}>
          <InputLabel id="task-filter-label" shrink>{t('course.timeline.filter-exercises')}</InputLabel>
          <Select
            labelId="task-filter-label"
            multiple
            displayEmpty
            value={selectedTaskIds}
            onChange={handleTaskFilterChange}
            input={<OutlinedInput label={t('course.timeline.filter-exercises')} notched />}
            renderValue={(selected) => {
              if (selected.length === 0) return t('course.timeline.all-exercises-selected');
              return t('course.timeline.selected-count', {count: selected.length});
            }}
          >
            {visibleTasks.map(task => (
              <MenuItem key={task.id} value={task.id}>
                <Checkbox checked={selectedTaskIds.includes(task.id)} />
                <ListItemText primary={task.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel id="sisu-filter-label">{t('course.timeline.sisu-export-status')}</InputLabel>
          <Select
            labelId="sisu-filter-label"
            value={sisuFilter}
            label={t('course.timeline.sisu-export-status')}
            onChange={e => setSisuFilter(e.target.value)}
          >
            <MenuItem value="all">{t('course.timeline.all-students')}</MenuItem>
            <MenuItem value="exported">{t('course.timeline.exported')}</MenuItem>
            <MenuItem value="not-exported">{t('course.timeline.not-exported')}</MenuItem>
          </Select>
        </FormControl>

        <Search
          value={search}
          onChange={e => setSearch(e.target.value)}
          reset={() => setSearch('')}
        />

      </Stack>
    </Stack>
  );
};

export default TimelineToolbar;
