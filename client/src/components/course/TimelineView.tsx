// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {useQueryClient} from '@tanstack/react-query';
import {useVirtualizer} from '@tanstack/react-virtual';
import dayjs, {type Dayjs} from 'dayjs';
import {useSnackbar} from 'notistack';
import {
  type JSX,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import Search from '@/components/shared/Search';
import {useEditGrade, useGetGrades} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import TimelineRow from './timeline/TimelineRow';
import {useTimelineData} from './timeline/useTimelineData';

// Constants for layout
const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 42;
const SIDEBAR_WIDTH = 280;
const MIN_PX_PER_DAY = 1.5;
const MAX_PX_PER_DAY = 10;

const TimelineView = (): JSX.Element => {
  const {t, i18n} = useTranslation();
  const {courseId} = useParams();
  const theme = useTheme();
  const {auth, isTeacherInCharge, isAssistant} = useAuth();
  const {data: gradesData, isLoading} = useGetGrades(Number(courseId));
  const editGradeMutation = useEditGrade(Number(courseId));
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkDate, setBulkDate] = useState<Dayjs | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sisuFilter, setSisuFilter] = useState<'all' | 'exported' | 'not-exported'>('all');
  const [search, setSearch] = useState('');
  const [pxPerDay, setPxPerDay] = useState<number>(3);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number; y: number} | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{x: number; y: number} | null>(null);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge || isAssistant,
    [auth?.role, isTeacherInCharge, isAssistant]
  );

  // Viewport state
  // eslint-disable-next-line react/hook-use-state
  const [viewStart] = useState(dayjs().startOf('month').subtract(1, 'month').valueOf());
  const parentRef = useRef<HTMLDivElement>(null);

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

  // Process data
  const {groups, items} = useTimelineData(gradesData, sisuFilter, expandedGroups, search);

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

  const handleItemSelect = (itemId: number, e: React.MouseEvent): void => {
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
  };

  // Rendering helpers
  const getX = (time: number): number => {
    const diffDays = dayjs(time).diff(dayjs(viewStart), 'days', true);
    return diffDays * pxPerDay;
  };

  const renderMonths = (): JSX.Element[] => {
    const months = [];
    const start = dayjs(viewStart);
    // Calculate end based on a reasonable width
    const visibleWidth = 3000;
    const daysToRender = visibleWidth / pxPerDay;
    const end = dayjs(viewStart).add(daysToRender, 'days');

    let current = start.clone().startOf('month');
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
            pl: 1,
            pt: 1,
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

  const handleMouseDown = (e: React.MouseEvent): void => {
    if (!editRights) return;
    const rect = parentRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;

    if (viewportX < SIDEBAR_WIDTH || viewportY < HEADER_HEIGHT) return;

    e.preventDefault();
    e.stopPropagation();

    const x = viewportX + (parentRef.current?.scrollLeft ?? 0);
    const y = viewportY + (parentRef.current?.scrollTop ?? 0);

    setIsDragging(true);
    setSelectionStart({x, y});
    setSelectionCurrent({x, y});

    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      setSelectedItems([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDragging || !selectionStart) return;

    const rect = parentRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left + (parentRef.current?.scrollLeft ?? 0);
    const y = e.clientY - rect.top + (parentRef.current?.scrollTop ?? 0);

    setSelectionCurrent({x, y});
  };

  const handleMouseUp = (e: React.MouseEvent): void => {
    if (!isDragging || !selectionStart || !selectionCurrent) return;

    const minX = Math.min(selectionStart.x, selectionCurrent.x) - SIDEBAR_WIDTH;
    const maxX = Math.max(selectionStart.x, selectionCurrent.x) - SIDEBAR_WIDTH;
    const minY = Math.min(selectionStart.y, selectionCurrent.y);
    const maxY = Math.max(selectionStart.y, selectionCurrent.y);

    // Find overlapping groups
    const startGroupIndex = Math.max(0, Math.floor((minY - HEADER_HEIGHT) / ROW_HEIGHT));
    const endGroupIndex = Math.min(groups.length - 1, Math.floor((maxY - HEADER_HEIGHT) / ROW_HEIGHT));

    const newSelectedIds = new Set<number>();

    for (let i = startGroupIndex; i <= endGroupIndex; i++) {
      const group = groups[i];
      const groupItems = items.filter(item => item.groupId === group.id);

      groupItems.forEach((item) => {
        const itemStartX = getX(item.start);
        const itemEndX = getX(item.end);
        const itemWidth = Math.max(itemEndX - itemStartX, 24);

        // Check horizontal overlap
        if (itemStartX < maxX && (itemStartX + itemWidth) > minX) {
          newSelectedIds.add(item.id);
          if (item.isSummary && item.relatedGradeIds) {
            item.relatedGradeIds.forEach(id => newSelectedIds.add(id));
          }
        }
      });
    }

    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (e.ctrlKey || e.metaKey) {
        newSelectedIds.forEach(id => next.delete(id));
      } else {
        newSelectedIds.forEach(id => next.add(id));
      }
      return Array.from(next);
    });

    setIsDragging(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  if (isLoading) {
    return <Typography>{t('course.timeline.loading')}</Typography>;
  }

  return (
    <Box sx={{height: '85vh', display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" width="fit-content">
          {t('course.timeline.title')}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center" sx={{width: 200}}>
            <ZoomOut color="action" fontSize="small" />
            <Slider
              value={pxPerDay}
              min={MIN_PX_PER_DAY}
              max={MAX_PX_PER_DAY}
              step={0.5}
              onChange={(_, val) => setPxPerDay(val)}
              size="small"
            />
            <ZoomIn color="action" fontSize="small" />
          </Stack>

          <Search
            value={search}
            onChange={e => setSearch(e.target.value)}
            reset={() => setSearch('')}
          />

          <FormControl size="small" sx={{minWidth: 180}}>
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
        </Stack>
      </Stack>

      {selectedItems.length > 0 && editRights && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: 'auto',
            minWidth: 600,
            p: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{fontWeight: 500}}>
            {t('course.timeline.selected-count', {count: selectedItems.length})}
          </Typography>
          <Box sx={{flex: 1}} />
          <Typography variant="body2" color="text.secondary">
            {t('course.timeline.select-multiple-hint')}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t('course.timeline.new-expiry-date')}
              value={bulkDate}
              onChange={newValue => setBulkDate(newValue as Dayjs | null)}
              slotProps={{textField: {size: 'small'}}}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            onClick={handleBulkUpdate}
            disabled={!bulkDate}
            disableElevation
          >
            {t('course.timeline.update')}
          </Button>
        </Paper>
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
        }}
        ref={parentRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
            minWidth: 'fit-content',
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
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
            }}
          >
            {t('course.timeline.task-student')}
          </Box>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              height: HEADER_HEIGHT,
              minWidth: '3000px',
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
                items={items}
                getX={getX}
                toggleGroup={toggleGroup}
                handleItemSelect={handleItemSelect}
                selectedItems={selectedItems}
                rowHeight={ROW_HEIGHT}
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
