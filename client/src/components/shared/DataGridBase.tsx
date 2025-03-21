// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  DataGrid,
  type DataGridProps,
  type GridLocaleText,
} from '@mui/x-data-grid';
import {enUS, fiFI, svSE} from '@mui/x-data-grid/locales';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

// Load correct translations to the x-data-grid.
// ref. https://mui.com/x/react-data-grid/localization/
const DataGridBase = (props: DataGridProps): JSX.Element => {
  const {i18n} = useTranslation();

  const getLocales = (): Partial<GridLocaleText> => {
    switch (i18n.language) {
      case 'fi':
        return fiFI.components.MuiDataGrid.defaultProps.localeText;
      case 'sv':
        return svSE.components.MuiDataGrid.defaultProps.localeText;
      default:
        return enUS.components.MuiDataGrid.defaultProps.localeText;
    }
  };

  return <DataGrid localeText={getLocales()} {...props} />;
};

export default DataGridBase;
