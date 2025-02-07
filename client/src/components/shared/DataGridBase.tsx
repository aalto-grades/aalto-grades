// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DataGrid, DataGridProps} from '@mui/x-data-grid';
import { enUS, fiFI, svSE } from '@mui/x-data-grid/locales';
import {type JSX} from 'react';
import {useTranslation} from 'react-i18next';

// Load correct translations to the x-data-grid.
// ref. https://mui.com/x/react-data-grid/localization/
const DataGridBase = (props: DataGridProps): JSX.Element => {
  const {i18n} = useTranslation();

  const getLocales = () => {
    switch(i18n.language) {
      case "fi":
        return fiFI.components.MuiDataGrid.defaultProps.localeText;
      case "sv":
        return svSE.components.MuiDataGrid.defaultProps.localeText;
      default:
        return enUS.components.MuiDataGrid.defaultProps.localeText;
    }
  };

  return (
    <DataGrid
      localeText={getLocales()}
      {...props}
    />
  );
};

export default DataGridBase;
