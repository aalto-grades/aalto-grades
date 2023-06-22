// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DataGrid } from '@mui/x-data-grid';

const gridColumns = [{
  field: 'error',
  headerName: 'Error description',
  type: 'string',
  width: 500,
}];

function FileErrorDialog({ handleClose, open, errors }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll='paper'
      aria-labelledby="csv-parsing-errors"
      aria-describedby="dialog-for-displaying-csv-parsing-errors"
    >
      <DialogContent dividers={true}>
        <DataGrid
          rows={errors.map(error => ({
            id: error,
            error
          }))}
          columns={gridColumns}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10
              }
            },
          }}
          pageSizeOptions={[10, 15]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

FileErrorDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  errors: PropTypes.array
};

export default FileErrorDialog;
