// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  lighten,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {TimelineGroup, TimelineItem} from './useTimelineData';

interface TimelineRowProps {
  group: TimelineGroup;
  items: TimelineItem[];
  selectedItems: number[];
  toggleGroup: (groupId: string) => void;
  handleItemSelect: (itemId: number, e: React.MouseEvent) => void;
  getX: (time: number) => number;
  rowHeight: number;
}

const TimelineRow = ({
  group,
  items,
  selectedItems,
  toggleGroup,
  handleItemSelect,
  getX,
  rowHeight,
}: TimelineRowProps): JSX.Element => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'contents'}}>
      {/* Sidebar Cell */}
      <Box
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 30,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRight: `1px solid ${theme.palette.divider}`,
          height: rowHeight,
          display: 'flex',
          alignItems: 'center',
          pl: group.isRoot ? 2 : 5,
          pr: 2,
          cursor: group.isRoot ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundImage: `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
          },
        }}
        onClick={() => group.isRoot && toggleGroup(group.id)}
      >
        {group.isRoot && (
          <IconButton size="small" sx={{mr: 1, p: 0.5}}>
            {group.expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        )}
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: group.isRoot ? 600 : 400,
            color: group.isRoot ? theme.palette.text.primary : theme.palette.text.secondary,
          }}
          title={typeof group.title === 'string' ? group.title : ''}
        >
          {group.title}
        </Typography>
      </Box>

      {/* Timeline Cell */}
      <Box
        sx={{
          height: rowHeight,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          minWidth: '3000px',
          bgcolor: group.isRoot
            ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : theme.palette.primary.light)
            : 'transparent',
        }}
      >
        {/* Today Line Background */}
        <Box
          sx={{
            position: 'absolute',
            left: getX(dayjs().valueOf()),
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: alpha(theme.palette.error.main, 0.2),
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {items.filter(i => i.groupId === group.id).map((item) => {
          const startX = getX(item.start);
          const endX = getX(item.end);
          const width = Math.max(endX - startX, 24);
          const isSelected = selectedItems.includes(item.id);

          // Determine colors based on item type
          let bg = theme.palette.primary.main;
          let color = '#fff';
          let border = '2px solid transparent';

          if (item.isSummary) {
            bg = theme.palette.mode === 'dark' ? theme.palette.secondary.dark : lighten(theme.palette.secondary.main, 0.3);
            if (theme.palette.mode === 'light') {
              color = theme.palette.text.primary;
            }
          } else {
            bg = theme.palette.mode === 'dark' ? theme.palette.primary.dark : lighten(theme.palette.primary.main, 0.3);
          }

          if (item.hasForever) {
            bg = 'transparent';
            color = theme.palette.text.primary;
            border = `2px dashed ${item.isSummary ? theme.palette.secondary.main : theme.palette.primary.main}`;
          }

          return (
            <Tooltip
              followCursor
              placement="top"
              key={item.id}
              title={(
                <Box sx={{textAlign: 'center'}}>
                  <Typography variant="body2" component="div">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{opacity: 0.8}}>
                    {t('course.timeline.expires')}
                    :
                    {' '}
                    {item.hasForever
                      ? t('course.timeline.never')
                      : dayjs(item.end).format('YYYY-MM-DD')}
                  </Typography>
                </Box>
              )}
            >
              <Box
                onClick={e => handleItemSelect(item.id, e)}
                sx={{
                  position: 'absolute',
                  left: startX,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: rowHeight - 16,
                  width: width,
                  bgcolor: bg,
                  borderRadius: 1,
                  color: color,
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1,
                  pr: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: isSelected
                    ? `2px solid ${theme.palette.mode === 'light' ? '#0d47a1' : theme.palette.info.main}`
                    : border,
                  boxShadow: isSelected ? 4 : 0,
                  zIndex: isSelected ? 5 : 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    filter: 'brightness(1.1)',
                    zIndex: 10,
                    boxShadow: 2,
                  },
                  ...(item.hasForever && {
                    bgcolor: 'transparent',
                    backgroundImage: `repeating-linear-gradient(45deg, ${alpha(theme.palette.action.disabled, 0.1)}, ${alpha(theme.palette.action.disabled, 0.1)} 10px, transparent 10px, transparent 20px)`,
                    '&:hover': {
                      zIndex: 10,
                      boxShadow: 2,
                      bgcolor: alpha(theme.palette.action.hover, 0.1),
                      backgroundImage: `repeating-linear-gradient(45deg, ${alpha(theme.palette.action.disabled, 0.2)}, ${alpha(theme.palette.action.disabled, 0.2)} 10px, transparent 10px, transparent 20px)`,
                    },
                  }),
                }}
              >
                {item.title}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimelineRow;
