// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
import {type JSX, type MouseEvent, forwardRef, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useTableContext} from '@/context/useTableContext';

/** Toggle a string in an array */
const toggleString = (arr: string[], str: string): string[] => {
  const index = arr.indexOf(str);
  if (index > -1) arr.splice(index, 1);
  else arr.push(str);

  return arr;
};

const GroupByButton = forwardRef<HTMLSpanElement>((props, ref): JSX.Element => {
  const {t} = useTranslation();
  const {table} = useTableContext();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
  };
  const groupByElements = [
    [
      {
        id: 'latestBestGrade',
        name: t('course.results.table.latest-grade'),
        info: t('course.results.group-by-latest-grade'),
      },
      {id: 'Exported to Sisu', name: t('course.results.table.exported')},
      {id: 'finalGrade', name: t('general.final-grade')},
      {id: 'Grade preview', name: t('course.results.table.preview')},
    ],

    table
      .getAllColumns()
      .filter(c => c.columnDef.meta?.coursePart)
      .map(column => ({
        id: column.id,
        name: column.id,
        info: column.id,
      })),
  ];

  const tableGrouping = table.getState().grouping;
  const isActive = useMemo(() => tableGrouping.length > 0, [tableGrouping]);

  return (
    <>
      <span {...props} style={{display: 'flex'}} ref={ref}>
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
                .filter(el => table.getState().grouping.includes(el.id))
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
              title={element.info}
              placement="top"
              disableInteractive
            >
              <MenuItem
                selected={table.getState().grouping.includes(element.id)}
                onClick={() => {
                  console.log(table.getAllColumns());
                  table.setGrouping(old =>
                    structuredClone(toggleString(old, element.id))
                  );
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
});

GroupByButton.displayName = 'GroupByButton';

export default GroupByButton;
