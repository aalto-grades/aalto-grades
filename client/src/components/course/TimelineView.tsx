// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useVirtualizer} from '@tanstack/react-virtual';
import dayjs, {type Dayjs} from 'dayjs';
import {useSnackbar} from 'notistack';
import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import {useEditGrade, useGetAllGradingModels, useGetCourseTasks, useGetGrades} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import TimelineBulkAction from './timeline/TimelineBulkAction';
import TimelineRow from './timeline/TimelineRow';
import TimelineToolbar from './timeline/TimelineToolbar';
import {type SortBy, type SortOrder, useTimelineData} from './timeline/useTimelineData';
import {useTimelineFilters} from './timeline/useTimelineFilters';
import {useTimelineInteractions} from './timeline/useTimelineInteractions';

// Constants for layout
const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 42;
const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 150;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_PX_PER_DAY = 1.5;
const MAX_PX_PER_DAY = 10;

const TimelineView = (): JSX.Element => {
  const {t, i18n} = useTranslation();
  const {courseId} = useParams();
  const theme = useTheme();
  const {auth, isTeacherInCharge, isAssistant} = useAuth();
  const {data: gradesData, isLoading} = useGetGrades(Number(courseId));
  const {data: gradingModels} = useGetAllGradingModels(Number(courseId));
  const {data: courseTasks} = useGetCourseTasks(Number(courseId));
  const editGradeMutation = useEditGrade(Number(courseId));
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();

  // State
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkDate, setBulkDate] = useState<Dayjs | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [pxPerDay, setPxPerDay] = useState<number>(3);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isManualResize, setIsManualResize] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>(() => 'date' as SortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Filters Hook
  const {
    selectedGradingModelIds,
    selectedCoursePartIds,
    selectedTaskIds,
    sisuFilter,
    setSisuFilter,
    groupBy,
    search,
    setSearch,
    effectiveSelectedTaskIds,
    visibleTasks,
    pureGradingModels,
    coursePartModels,
    handleGradingModelFilterChange,
    handleCoursePartFilterChange,
    handleTaskFilterChange,
    handleGroupByChange,
  } = useTimelineFilters({
    gradingModels,
    courseTasks,
    gradesData,
  });

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge || isAssistant,
    [auth?.role, isTeacherInCharge, isAssistant]
  );

  // Process data
  const {groups, items, minDate, itemsByGroup} = useTimelineData(
    gradesData,
    sisuFilter,
    expandedGroups,
    search,
    groupBy,
    effectiveSelectedTaskIds,
    sortBy,
    sortOrder
  );

  // Auto-resize sidebar based on content
  useEffect(() => {
    if (groups.length === 0 || isManualResize) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const fontBase = '0.875rem "Roboto", "Helvetica", "Arial", sans-serif';

    let maxContentWidth = 0;

    groups.forEach((group) => {
      const isRoot = group.isRoot;
      const text = group.title as string;

      context.font = `${isRoot ? '600' : '400'} ${fontBase}`;
      const textWidth = context.measureText(text).width;

      const padding = isRoot ? 74 : 56;
      const totalWidth = textWidth + padding;

      if (totalWidth > maxContentWidth) {
        maxContentWidth = totalWidth;
      }
    });

    const finalWidth = Math.min(
      Math.max(maxContentWidth + 20, MIN_SIDEBAR_WIDTH),
      MAX_SIDEBAR_WIDTH
    );

    setSidebarWidth(finalWidth);
  }, [groups, isManualResize]);

  // Viewport state
  const viewStart = useMemo(() => {
    if (minDate) {
      return dayjs(minDate).subtract(1, 'month').startOf('month').valueOf();
    }
    return dayjs().subtract(2, 'year').startOf('year').valueOf();
  }, [minDate]);

  const viewEnd = useMemo(() => {
    return dayjs().add(16, 'months').endOf('month').valueOf();
  }, []);

  const totalWidth = useMemo(() => {
    const diffDays = dayjs(viewEnd).diff(dayjs(viewStart), 'days', true);
    return Math.max(diffDays * pxPerDay, 1000);
  }, [viewStart, viewEnd, pxPerDay]);

  const parentRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Rendering helpers
  const getX = useCallback((time: number): number => {
    const diffDays = dayjs(time).diff(dayjs(viewStart), 'days', true);
    return diffDays * pxPerDay;
  }, [viewStart, pxPerDay]);

  // Interactions Hook
  const {
    isDragging,
    isPanning,
    selectionStart,
    selectionCurrent,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleResizeStart,
  } = useTimelineInteractions({
    parentRef,
    sidebarWidth,
    setSidebarWidth,
    setIsManualResize,
    setPxPerDay,
    groups,
    itemsByGroup,
    getX,
    setSelectedItems,
    editRights,
    minSidebarWidth: MIN_SIDEBAR_WIDTH,
    maxSidebarWidth: MAX_SIDEBAR_WIDTH,
    minPxPerDay: MIN_PX_PER_DAY,
    maxPxPerDay: MAX_PX_PER_DAY,
    headerHeight: HEADER_HEIGHT,
    rowHeight: ROW_HEIGHT,
  });

  // Bulk Update
  const handleBulkUpdate = useCallback(async (): Promise<void> => {
    if (!bulkDate || selectedItems.length === 0) return;

    const newExpiryDate = bulkDate.toDate();
    const gradeIdsToUpdate = new Set<number>();

    selectedItems.forEach((itemId) => {
      if (itemId > 0) {
        gradeIdsToUpdate.add(itemId);
      } else {
        const item = items.find(i => i.id === itemId);
        if (item?.isSummary && item.relatedGradeIds) {
          item.relatedGradeIds.forEach(id => gradeIdsToUpdate.add(id));
        }
      }
    });

    try {
      await Promise.all(Array.from(gradeIdsToUpdate).map(async gradeId =>
        editGradeMutation.mutateAsync({
          gradeId,
          data: {expiryDate: newExpiryDate},
        })
      ));
      await queryClient.invalidateQueries({queryKey: ['grades', Number(courseId)]});
      enqueueSnackbar(t('course.timeline.items-updated-success', {count: gradeIdsToUpdate.size}), {variant: 'success'});
    } catch {
      enqueueSnackbar(t('course.timeline.items-update-fail'), {variant: 'error'});
    }
  }, [bulkDate, selectedItems, items, editGradeMutation, queryClient, courseId, enqueueSnackbar, t]);

  const handleItemSelect = useCallback((itemId: number, e: React.MouseEvent): void => {
    if (!editRights) return;
    e.stopPropagation();
    const isModifierPressed = e.ctrlKey || e.metaKey || e.shiftKey;

    const clickedItem = items.find(i => i.id === itemId);
    if (!clickedItem) return;

    setSelectedItems((prev) => {
      let newSelected = isModifierPressed ? [...prev] : [];
      const wasSelected = prev.includes(itemId);
      const isSelecting = isModifierPressed ? !wasSelected : true;

      const idsToModify = new Set<number>();

      if (clickedItem.isSummary && clickedItem.relatedGradeIds) {
        idsToModify.add(itemId);
        clickedItem.relatedGradeIds.forEach(id => idsToModify.add(id));
      } else {
        idsToModify.add(itemId);
      }

      if (isSelecting) {
        idsToModify.forEach((id) => {
          if (!newSelected.includes(id)) newSelected.push(id);
        });
      } else {
        newSelected = newSelected.filter(id => !idsToModify.has(id));
      }

      if (!clickedItem.isSummary) {
        const summaryItem = items.find(i => i.isSummary && i.relatedGradeIds?.includes(itemId));
        if (summaryItem?.relatedGradeIds) {
          const allChildrenSelected = summaryItem.relatedGradeIds.every(id => newSelected.includes(id));
          const summarySelected = newSelected.includes(summaryItem.id);

          if (allChildrenSelected && !summarySelected) {
            newSelected.push(summaryItem.id);
          } else if (!allChildrenSelected && summarySelected) {
            newSelected = newSelected.filter(id => id !== summaryItem.id);
          }
        }
      }

      return newSelected;
    });
  }, [editRights, items]);

  const toggleGroup = useCallback((groupId: string): void => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Rendering helpers
  const renderMonths = (): JSX.Element[] => {
    const months = [];
    const start = dayjs(viewStart);
    const end = dayjs(viewEnd);

    let current = start.clone();
    while (current.isBefore(end)) {
      const x = getX(current.valueOf());
      const monthWidth = current.daysInMonth() * pxPerDay;

      // Smart formatting based on available width
      let format = 'MMMM YYYY';
      if (monthWidth < 60) format = 'MMM';
      else if (monthWidth < 120) format = 'MMM YYYY';

      months.push(
        <Box
          key={current.format('YYYY-MM')}
          sx={{
            position: 'absolute',
            left: x,
            top: 0,
            height: '100%',
            borderLeft: `1px dashed ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 500,
            color: theme.palette.text.secondary,
            zIndex: 0,
            whiteSpace: 'nowrap',
            width: monthWidth,
            overflow: 'hidden',
            textOverflow: 'clip',
          }}
        >
          {current.locale(i18n.language).format(format)}
        </Box>
      );
      current = current.add(1, 'month');
    }
    return months;
  };

  const rowVirtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const activeGroup = useMemo(() => {
    if (virtualItems.length === 0) return null;
    const firstItemIndex = virtualItems[0].index;
    const firstGroup = groups[firstItemIndex];

    if (firstGroup.parentId) {
      return groups.find(g => g.id === firstGroup.parentId);
    }

    if (firstGroup.isRoot && firstGroup.expanded) {
      return firstGroup;
    }

    return null;
  }, [virtualItems, groups]);

  useEffect(() => {
    if (!isLoading && parentRef.current && !hasScrolledRef.current) {
      const todayX = getX(dayjs().valueOf());
      const viewportWidth = parentRef.current.clientWidth;
      const scrollPos = todayX - (viewportWidth - sidebarWidth) / 2;
      parentRef.current.scrollLeft = Math.max(0, scrollPos);
      hasScrolledRef.current = true;
    }
  }, [isLoading, getX, sidebarWidth]);

  if (isLoading) {
    return <Typography>{t('course.timeline.loading')}</Typography>;
  }

  return (
    <Box sx={{height: '85vh', display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
      <TimelineToolbar
        pxPerDay={pxPerDay}
        setPxPerDay={setPxPerDay}
        minPxPerDay={MIN_PX_PER_DAY}
        maxPxPerDay={MAX_PX_PER_DAY}
        groupBy={groupBy}
        handleGroupByChange={handleGroupByChange}
        selectedGradingModelIds={selectedGradingModelIds}
        handleGradingModelFilterChange={handleGradingModelFilterChange}
        gradingModels={pureGradingModels}
        selectedCoursePartIds={selectedCoursePartIds}
        handleCoursePartFilterChange={handleCoursePartFilterChange}
        coursePartModels={coursePartModels}
        selectedTaskIds={selectedTaskIds}
        handleTaskFilterChange={handleTaskFilterChange}
        visibleTasks={visibleTasks}
        sisuFilter={sisuFilter}
        setSisuFilter={setSisuFilter}
        search={search}
        setSearch={setSearch}
      />

      {selectedItems.length > 0 && editRights && (
        <TimelineBulkAction
          selectedCount={selectedItems.length}
          bulkDate={bulkDate}
          setBulkDate={setBulkDate}
          handleBulkUpdate={handleBulkUpdate}
        />
      )}

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          cursor: isPanning ? 'grabbing' : 'default',
        }}
        ref={parentRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${sidebarWidth}px 1fr`,
            width: 'max-content',
            minWidth: '100%',
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              gridColumn: 1,
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 50,
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              borderRight: `1px solid ${theme.palette.divider}`,
              height: HEADER_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              fontWeight: 600,
              color: theme.palette.text.primary,
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle2" noWrap>
              {t('course.timeline.grades-table')}
            </Typography>
            <IconButton
              size="small"
              onClick={e => setAnchorEl(e.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="caption" color="textSecondary">
                  {t('course.timeline.sort-by')}
                </Typography>
              </MenuItem>
              <MenuItem
                selected={sortBy === 'student'}
                onClick={() => {
                  setSortBy('student');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.student-name')}
              </MenuItem>
              <MenuItem
                selected={sortBy === 'task'}
                onClick={() => {
                  setSortBy('task');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.task-name')}
              </MenuItem>
              <MenuItem
                selected={sortBy === 'date'}
                onClick={() => {
                  setSortBy('date');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.added')}
              </MenuItem>
              <MenuItem
                selected={sortBy === 'expiry'}
                onClick={() => {
                  setSortBy('expiry');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.expires')}
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="textSecondary">
                  {t('course.timeline.order')}
                </Typography>
              </MenuItem>
              <MenuItem
                selected={sortOrder === 'asc'}
                onClick={() => {
                  setSortOrder('asc');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.ascending')}
              </MenuItem>
              <MenuItem
                selected={sortOrder === 'desc'}
                onClick={() => {
                  setSortOrder('desc');
                  setAnchorEl(null);
                }}
              >
                {t('course.timeline.descending')}
              </MenuItem>
            </Menu>
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 4,
                cursor: 'col-resize',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
                zIndex: 51,
              }}
              onMouseDown={handleResizeStart}
              onDoubleClick={() => setIsManualResize(false)}
            />
          </Box>
          <Box
            sx={{
              gridColumn: 2,
              position: 'sticky',
              top: 0,
              zIndex: 40,
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              height: HEADER_HEIGHT,
              minWidth: totalWidth,
            }}
          >
            {renderMonths()}
            {/* Today Marker Header */}
            <Box
              sx={{
                position: 'absolute',
                left: getX(dayjs().valueOf()),
                top: HEADER_HEIGHT - 20,
                transform: 'translateX(-50%)',
                bgcolor: theme.palette.error.main,
                color: 'white',
                px: 1,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                zIndex: 45,
              }}
            >
              {t('course.timeline.today')}
            </Box>
          </Box>

          {/* Floating Header for Active Group */}
          {activeGroup && (
            <TimelineRow
              key="floating-header"
              group={activeGroup}
              items={itemsByGroup[activeGroup.id] ?? []}
              getX={getX}
              toggleGroup={toggleGroup}
              handleItemSelect={handleItemSelect}
              selectedItems={selectedItems}
              rowHeight={ROW_HEIGHT}
              totalWidth={totalWidth}
              isFloating
            />
          )}

          {/* Top Spacer */}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <Box sx={{gridColumn: '1 / -1', height: rowVirtualizer.getVirtualItems()[0].start}} />
          )}

          {/* Data Rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const group = groups[virtualRow.index];
            return (
              <TimelineRow
                key={group.id}
                group={group}
                items={itemsByGroup[group.id] ?? []}
                getX={getX}
                toggleGroup={toggleGroup}
                handleItemSelect={handleItemSelect}
                selectedItems={selectedItems}
                rowHeight={ROW_HEIGHT}
                totalWidth={totalWidth}
              />
            );
          })}

          {/* Bottom Spacer */}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <Box sx={{gridColumn: '1 / -1', height: rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}} />
          )}

          {/* Drag Selection Overlay */}
          {isDragging && selectionStart && selectionCurrent && (
            <Box
              style={{
                left: Math.min(selectionStart.x, selectionCurrent.x),
                top: Math.min(selectionStart.y, selectionCurrent.y),
                width: Math.abs(selectionCurrent.x - selectionStart.x),
                height: Math.abs(selectionCurrent.y - selectionStart.y),
              }}
              sx={{
                position: 'absolute',
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.4 : 0.2),
                border: `1px solid ${theme.palette.primary.main}`,
                zIndex: 100,
                pointerEvents: 'none',
                // Hide if dimensions are invalid or too small to prevent artifacts
                display: (Math.abs(selectionCurrent.x - selectionStart.x) < 2 && Math.abs(selectionCurrent.y - selectionStart.y) < 2) ? 'none' : 'block'
              }}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TimelineView;
