// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {darken, lighten, styled} from '@mui/material';
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

const getBackgroundColor = (color: string, mode: string): string =>
  mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7);

const getHoverBackgroundColor = (color: string, mode: string): string =>
  mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

const getSelectedBackgroundColor = (color: string, mode: string): string =>
  mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

const getSelectedHoverBackgroundColor = (
  color: string,
  mode: string
): string => (mode === 'dark' ? darken(color, 0.4) : lighten(color, 0.4));

const StyledDataGrid = styled(DataGridBase)(({theme}) => ({
  '& .invalid-value-data-grid': {
    backgroundColor: getBackgroundColor(
      theme.palette.error.main,
      theme.palette.mode
    ),
    '&:hover': {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.error.main,
        theme.palette.mode
      ),
    },
    '&.Mui-selected': {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.error.main,
        theme.palette.mode
      ),
      '&:hover': {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.error.main,
          theme.palette.mode
        ),
      },
    },
  },
}));

export default StyledDataGrid;
