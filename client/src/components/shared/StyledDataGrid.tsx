// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Theme, darken, lighten, styled} from '@mui/material';
import type {GridRowClassNameParams, GridValidRowModel} from '@mui/x-data-grid';

import DataGridBase from '@/components/shared/DataGridBase';
// Pretty much just adds color to selected and error columns

export type ProcessRowUpdate = (
  newRow: GridValidRowModel,
  oldRow: GridValidRowModel
) => GridValidRowModel;

export type GetRowClassName = (
  params: GridRowClassNameParams<GridValidRowModel>
) => string;

const coefficients = {
  default: 0.4,
  hover: 0.2,
  selected: 0.6,
  selectedHover: 0.5,
};

const getBackgroundColor = (
  color: string,
  theme: Theme,
  state: 'default' | 'hover' | 'selected' | 'selectedHover'
) => {
  const coefficient = coefficients[state];

  return {
    backgroundColor: darken(color, coefficient),
    ...theme.applyStyles('light', {
      backgroundColor: lighten(color, coefficient),
    }),
  };
};

const StyledDataGrid = styled(DataGridBase)(({theme}) => ({
  '& .row-selected': {
    ...getBackgroundColor(theme.palette.success.light, theme, 'default'),
    '&:hover': {
      ...getBackgroundColor(theme.palette.success.light, theme, 'hover'),
    },
    '&.Mui-selected': {
      ...getBackgroundColor(theme.palette.success.main, theme, 'selected'),
      '&:hover': {
        ...getBackgroundColor(
          theme.palette.success.main,
          theme,
          'selectedHover'
        ),
      },
    },
  },
  '& .invalid-value-data-grid': {
    ...getBackgroundColor(theme.palette.error.main, theme, 'default'),
    '&:hover': {
      ...getBackgroundColor(theme.palette.error.main, theme, 'hover'),
    },
    '&.Mui-selected': {
      ...getBackgroundColor(theme.palette.error.main, theme, 'selected'),
      '&:hover': {
        ...getBackgroundColor(theme.palette.error.main, theme, 'selectedHover'),
      },
    },
  },
  '& .Mui-error': {
    backgroundColor: 'rgb(126,10,15, 0.1)',
    color: '#750f0f',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgb(126,10,15, 0.5)',
      color: '#ff4343',
    }),
  },
}));

export default StyledDataGrid;
