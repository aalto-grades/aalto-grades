// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import {ButtonBase, Divider, Menu, MenuItem, useTheme} from '@mui/material';
import {type JSX, type MouseEvent, useState} from 'react';

export type FilterOption = {id: string | number; name: string};

type PropsType = {
  /** Label shown when no option is selected */
  label: string;
  selected: boolean;
  /** Sections of options, separated by dividers in the menu */
  options: FilterOption[][];
  selectedId?: string | number;
  onSelect: (id: string | number) => void;
  onClear: () => void;
};

/**
 * Dropdown filter button with an attached clear button, the shared pattern
 * behind the grades table assessment filter and the final grades model filter.
 */
const FilterMenuButton = ({
  label,
  selected,
  options,
  selectedId,
  onSelect,
  onClear,
}: PropsType): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <span style={{display: 'flex'}}>
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
            ...(selected && {
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
            {label}
          </div>

          {!selected && (
            <ArrowDropDownIcon
              style={{alignContent: 'center', fontSize: '18px'}}
            />
          )}
        </ButtonBase>
        {selected && (
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
            onClick={onClear}
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
        {options.map((section, i) => [
          ...section.map(option => (
            <MenuItem
              key={option.id}
              onClick={() => {
                onSelect(option.id);
                handleClose();
              }}
              value={option.id}
              selected={selected && option.id === selectedId}
            >
              {option.name}
            </MenuItem>
          )),
          ...(i !== options.length - 1 ? [<Divider key={i} />] : []),
        ])}
      </Menu>
    </>
  );
};

export default FilterMenuButton;
