// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type Dispatch,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  type WheelEvent,
  useState,
} from 'react';

import type {TimelineGroup, TimelineItem} from './useTimelineData';

interface UseTimelineInteractionsProps {
  parentRef: RefObject<HTMLDivElement | null>;
  sidebarWidth: number;
  setSidebarWidth: Dispatch<SetStateAction<number>>;
  setPxPerDay: Dispatch<SetStateAction<number>>;
  groups: TimelineGroup[];
  itemsByGroup: Record<string, TimelineItem[] | undefined>;
  getX: (time: number) => number;
  setSelectedItems: Dispatch<SetStateAction<number[]>>;
  editRights: boolean;
  minSidebarWidth: number;
  maxSidebarWidth: number;
  minPxPerDay: number;
  maxPxPerDay: number;
  headerHeight: number;
  rowHeight: number;
}

interface UseTimelineInteractionsResult {
  isDragging: boolean;
  isPanning: boolean;
  selectionStart: {x: number; y: number} | null;
  selectionCurrent: {x: number; y: number} | null;
  isResizingSidebar: boolean;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  handleMouseLeave: () => void;
  handleWheel: (e: WheelEvent) => void;
  handleResizeStart: (e: MouseEvent) => void;
}

export const useTimelineInteractions = ({
  parentRef,
  sidebarWidth,
  setSidebarWidth,
  setPxPerDay,
  groups,
  itemsByGroup,
  getX,
  setSelectedItems,
  editRights,
  minSidebarWidth,
  maxSidebarWidth,
  minPxPerDay,
  maxPxPerDay,
  headerHeight,
  rowHeight,
}: UseTimelineInteractionsProps): UseTimelineInteractionsResult => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{x: number; y: number; scrollLeft: number; scrollTop: number} | null>(null);
  const [selectionStart, setSelectionStart] = useState<{x: number; y: number} | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{x: number; y: number} | null>(null);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const handleMouseDown = (e: MouseEvent): void => {
    const element = parentRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;

    if (viewportX < sidebarWidth || viewportY < headerHeight) return;

    // Middle mouse button panning
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      });
      return;
    }

    if (e.button !== 0 || !editRights) return;

    e.preventDefault();
    e.stopPropagation();

    const x = viewportX + element.scrollLeft;
    const y = viewportY + element.scrollTop;

    setIsDragging(true);
    setSelectionStart({x, y});
    setSelectionCurrent({x, y});

    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      setSelectedItems([]);
    }
  };

  const handleResizeStart = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingSidebar(true);
  };

  const handleMouseMove = (e: MouseEvent): void => {
    const element = parentRef.current;
    if (!element) return;

    if (isResizingSidebar) {
      const rect = element.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      setSidebarWidth(Math.min(Math.max(newWidth, minSidebarWidth), maxSidebarWidth));
      return;
    }

    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      element.scrollLeft = panStart.scrollLeft - dx;
      element.scrollTop = panStart.scrollTop - dy;
    } else if (isDragging && selectionStart) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left + element.scrollLeft;
      const y = e.clientY - rect.top + element.scrollTop;

      setSelectionCurrent({x, y});
    }
  };

  const handleMouseUp = (e: MouseEvent): void => {
    if (isResizingSidebar) {
      setIsResizingSidebar(false);
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (isDragging && selectionStart && selectionCurrent) {
      const minX = Math.min(selectionStart.x, selectionCurrent.x) - sidebarWidth;
      const maxX = Math.max(selectionStart.x, selectionCurrent.x) - sidebarWidth;
      const minY = Math.min(selectionStart.y, selectionCurrent.y);
      const maxY = Math.max(selectionStart.y, selectionCurrent.y);

      // Find overlapping groups
      const startGroupIndex = Math.max(0, Math.floor((minY - headerHeight) / rowHeight));
      const endGroupIndex = Math.min(groups.length - 1, Math.floor((maxY - headerHeight) / rowHeight));

      const newSelectedIds = new Set<number>();

      for (let i = startGroupIndex; i <= endGroupIndex; i++) {
        const group = groups[i];
        const groupItems = itemsByGroup[group.id] ?? [];

        groupItems.forEach((item) => {
          const itemStartX = getX(item.start);
          const itemEndX = getX(item.end);
          const itemWidth = itemEndX - itemStartX;

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
    }

    setIsDragging(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
    setIsPanning(false);
    setPanStart(null);
  };

  const handleMouseLeave = (): void => {
    setIsResizingSidebar(false);
    setIsDragging(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
    setIsPanning(false);
    setPanStart(null);
  };

  const handleWheel = (e: WheelEvent): void => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      setPxPerDay(prev => Math.min(Math.max(prev + delta * 0.5, minPxPerDay), maxPxPerDay));
    }
  };

  return {
    isDragging,
    isPanning,
    selectionStart,
    selectionCurrent,
    isResizingSidebar,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleResizeStart,
  };
};
