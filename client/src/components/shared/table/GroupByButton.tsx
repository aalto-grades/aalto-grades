// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import {
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import type {RowData} from '@tanstack/react-table';
import {type JSX, type MouseEvent, type Ref, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {SharedTable} from './features';

/**
 * Toggle a string in an array.
 *
 * Must stay immutable: TanStack v9 compares the updater result against the
 * current state slice and drops it when the contents are unchanged, so
 * mutating the previous array would make the update a silent no-op.
 */
const toggleString = (arr: string[], str: string): string[] =>
  arr.includes(str) ? arr.filter(e => e !== str) : [...arr, str];

export type GroupByElement = {
  id: string;
  name: string;
  info?: string;
};

type PropsType<TData extends RowData> = {
  table: SharedTable<TData>;
  /**
   * Extra grouping options shown above the automatically detected source
   * columns (columns with `meta.coursePart`). Each inner array becomes a
   * section separated by a divider.
   */
  extraGroups?: GroupByElement[][];
  ref?: Ref<HTMLSpanElement>;
};

const GroupByButton = <TData extends RowData>({
  table,
  extraGroups = [],
  ref,
}: PropsType<TData>): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const sourceGroups = table
    .getAllColumns()
    .filter(c => c.columnDef.meta?.coursePart)
    .map(column => ({
      id: column.id,
      name: column.id,
      info: column.id,
    }));

  const groupByElements = [
    ...extraGroups,
    sourceGroups,
  ].filter(group => group.length > 0);

  const tableGrouping = table.state.grouping;
  const isActive = useMemo(() => tableGrouping.length > 0, [tableGrouping]);

  return (
    <>
      <span style={{display: 'flex'}} ref={ref}>
        <ButtonBase
          sx={{
            display: 'flex',
            borderRadius: '8px',
            textAlign: 'center',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.23)' : '1px solid black',
            alignContent: 'center',
            padding: '0px 8px',
            fontSize: '14px',
            alignItems: 'center',
            lineHeight: '20px',
            cursor: 'pointer',
            position: 'relative',
            backgroundColor: 'transparent',
            ...(isActive && {
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.info.dark
                : theme.palette.info.light,
              border: 'none',
              borderRadius: '8px 0px 0px 8px',
            }),
          }}
          onClick={handleClick}
        >
          <div
            style={{
              alignContent: 'center',
              padding: '0px 8px',
              width: 'max-content',
            }}
          >
            {t('course.results.group-by', {
              grouping: groupByElements
                .flat()
                .filter(el => tableGrouping.includes(el.id))
                .map(el => el.name)
                .join(', '),
            })}
          </div>

          {!isActive && (
            <ArrowDropDownIcon
              style={{alignContent: 'center', fontSize: '18px'}}
            />
          )}
        </ButtonBase>

        {isActive && (
          <ButtonBase
            sx={{
              display: 'flex',
              borderRadius: '0px 8px 8px 0',
              textAlign: 'center',
              alignContent: 'center',
              padding: '0px 8px',
              fontSize: '14px',
              alignItems: 'center',
              lineHeight: '20px',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.info.dark
                : theme.palette.info.light,
              border: 'none',
            }}
            onClick={() => table.setGrouping([])}
          >
            <ClearIcon style={{alignContent: 'center', fontSize: '18px'}} />
          </ButtonBase>
        )}
      </span>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{maxHeight: '50vh'}}
      >
        {groupByElements.map((groups, i) => [
          ...groups.map(element => (
            <Tooltip
              key={element.id}
              title={element.info ?? element.name}
              placement="top"
              disableInteractive
            >
              <MenuItem
                selected={tableGrouping.includes(element.id)}
                onClick={() => {
                  table.setGrouping(old => toggleString(old, element.id));
                  handleClose();
                }}
              >
                {element.name}
              </MenuItem>
            </Tooltip>
          )),

          // Only add divider between elements
          ...(i !== groupByElements.length - 1
            ? [<Divider key={i} sx={{my: 0}} />]
            : []),
        ])}
      </Menu>
    </>
  );
};

GroupByButton.displayName = 'GroupByButton';

export default GroupByButton;
