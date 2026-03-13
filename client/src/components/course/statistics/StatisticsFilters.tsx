// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material';
import type {Dayjs} from 'dayjs';
import type {JSX} from 'react';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import type {CoursePartData, CourseTaskData} from '@/common/types';
import LocalizedDatePicker from '@/components/shared/LocalizedDatePicker';
import {generateYearLabels} from '@/utils/statisticsHelpers';

type GroupingType = 'CALENDAR' | 'ACADEMIC' | 'CUSTOM';

interface StatisticsFiltersProps {
  selectedModel: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  grouping: GroupingType;
  selectedYear: string;
  selectedPart?: string;
  selectedTask?: string;
  gradingModels: Array<{id: number; name: string}>;
  courseParts?: CoursePartData[];
  courseTasks?: CourseTaskData[];
  oldestDate?: Dayjs | null;
  onModelChange: (model: string) => void;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  onGroupingChange: (grouping: GroupingType) => void;
  onYearChange: (year: string) => void;
  onPartChange?: (part: string) => void;
  onTaskChange?: (task: string) => void;
  onClearFilters: () => void;
}

const StatisticsFilters = ({
  selectedModel,
  startDate,
  endDate,
  grouping,
  selectedYear,
  selectedPart,
  selectedTask,
  gradingModels,
  courseParts,
  courseTasks,
  oldestDate,
  onModelChange,
  onStartDateChange,
  onEndDateChange,
  onGroupingChange,
  onYearChange,
  onPartChange,
  onTaskChange,
  onClearFilters,
}: StatisticsFiltersProps): JSX.Element => {
  const {t} = useTranslation();

  // Calculate available years for dropdown based on grouping and actual course data
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Determine the starting year based on oldest date or default to 10 years back
    let startYear: number;
    if (oldestDate) {
      startYear = oldestDate.year();
      // For academic year grouping, adjust if the oldest date is before August
      if (grouping === 'ACADEMIC' && oldestDate.month() < 7) {
        // Month is 0-indexed, so < 7 means before August (month 7)
        // This date belongs to the previous academic year
        startYear = startYear - 1;
      }
    } else {
      startYear = currentYear - 10;
    }

    // Generate years using helper function
    return generateYearLabels(
      grouping === 'CALENDAR' ? 'CALENDAR' : 'ACADEMIC',
      startYear,
      currentYear,
    );
  }, [grouping, oldestDate]);

  const hasActiveFilters =
    selectedModel
    || startDate
    || endDate
    || grouping !== 'ACADEMIC'
    || selectedYear !== 'All'
    || selectedPart
    || selectedTask;

  return (
    <Card
      sx={{mb: 3, p: 3, bgcolor: 'background.paper', borderRadius: 3}}
      elevation={0}
      variant="outlined"
    >
      <Typography variant="h6" gutterBottom sx={{mb: 3, fontWeight: 600}}>
        {t('statistics.filter-options') || 'Filter Options'}
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: Grading Model and Module/Exercise Filter */}
        <Grid size={{xs: 12, md: 6}}>
          <FormControl fullWidth size="small">
            <InputLabel id="grading-model-select-label">
              {t('course.statistics.grading-model') || 'Grading Model'}
            </InputLabel>
            <Select
              labelId="grading-model-select-label"
              id="grading-model-select"
              value={selectedModel}
              label={t('course.statistics.grading-model') || 'Grading Model'}
              onChange={e => onModelChange(e.target.value)}
            >
              <MenuItem value="">
                <em>{t('course.statistics.all-models') || 'All Models'}</em>
              </MenuItem>
              {gradingModels.map(model => (
                <MenuItem key={model.id} value={String(model.id)}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {courseParts && onPartChange && (
          <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth size="small">
              <InputLabel id="course-part-select-label">
                {t('statistics.filter-by-module') || 'Filter by Module'}
              </InputLabel>
              <Select
                labelId="course-part-select-label"
                id="course-part-select"
                value={selectedPart || ''}
                label={t('statistics.filter-by-module') || 'Filter by Module'}
                onChange={(e) => {
                  onPartChange(e.target.value);
                  if (onTaskChange) onTaskChange('');
                }}
              >
                <MenuItem value="">
                  <em>{t('statistics.all-modules') || 'All Modules'}</em>
                </MenuItem>
                {courseParts.map(part => (
                  <MenuItem key={part.id} value={String(part.id)}>
                    {part.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {courseTasks && onTaskChange && selectedPart && (
          <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth size="small">
              <InputLabel id="course-task-select-label">
                {t('statistics.filter-by-exercise') || 'Filter by Exercise'}
              </InputLabel>
              <Select
                labelId="course-task-select-label"
                id="course-task-select"
                value={selectedTask || ''}
                label={
                  t('statistics.filter-by-exercise') || 'Filter by Exercise'
                }
                onChange={e => onTaskChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>{t('statistics.all-exercises') || 'All Exercises'}</em>
                </MenuItem>
                {courseTasks
                  .filter(task => task.coursePartId === Number(selectedPart))
                  .map(task => (
                    <MenuItem key={task.id} value={String(task.id)}>
                      {task.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Row 2: Date Grouping Options */}
        <Grid size={{xs: 12}}>
          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              {t('statistics.group-by') || 'Group by'}
            </Typography>
            <RadioGroup
              row
              value={grouping}
              onChange={(e) => {
                onGroupingChange(e.target.value as GroupingType);
                onYearChange('All');
              }}
              sx={{gap: 2, flexWrap: 'wrap'}}
            >
              <FormControlLabel
                value="CALENDAR"
                control={<Radio size="small" />}
                label={(
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <CalendarTodayIcon fontSize="small" />
                    <span>
                      {t('statistics.calendar-year') || 'Calendar Year'}
                    </span>
                  </Box>
                )}
              />
              <FormControlLabel
                value="ACADEMIC"
                control={<Radio size="small" />}
                label={(
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <DateRangeIcon fontSize="small" />
                    <span>
                      {t('statistics.academic-year') || 'Academic Year'}
                    </span>
                  </Box>
                )}
              />
              <FormControlLabel
                value="CUSTOM"
                control={<Radio size="small" />}
                label={(
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <TuneIcon fontSize="small" />
                    <span>
                      {t('statistics.custom-range') || 'Custom Range'}
                    </span>
                  </Box>
                )}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Row 3: Year Filter or Custom Date Range */}
        {grouping === 'CUSTOM'
          ? (
              <>
                <Grid size={{xs: 12, md: 6}}>
                  <LocalizedDatePicker
                    label={t('course.statistics.start-date') || 'Start Date'}
                    value={startDate}
                    onChange={onStartDateChange}
                    slotProps={{
                      textField: {size: 'small', fullWidth: true},
                    }}
                  />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <LocalizedDatePicker
                    label={t('course.statistics.end-date') || 'End Date'}
                    value={endDate}
                    onChange={onEndDateChange}
                    slotProps={{
                      textField: {size: 'small', fullWidth: true},
                    }}
                  />
                </Grid>
              </>
            )
          : (
              <Grid size={{xs: 12, md: 6}}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('statistics.filter-year') || 'Year'}</InputLabel>
                  <Select
                    value={selectedYear}
                    label={t('statistics.filter-year') || 'Year'}
                    onChange={e => onYearChange(e.target.value)}
                  >
                    <MenuItem value="All">
                      <em>{t('statistics.all-years') || 'All Years'}</em>
                    </MenuItem>
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Grid size={{xs: 12}}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClearFilters}
                startIcon={<FilterAltOffIcon />}
                sx={{borderColor: 'divider'}}
              >
                {t('general.clear') || 'Clear Filters'}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

export default StatisticsFilters;
