import {DialogContent, DialogTitle} from '@mui/material';
import {DataGrid, GridColDef, GridRowsProp} from '@mui/x-data-grid';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp;
};

const UploadDialogConfirm = ({columns, rows}: PropsType) => {
  return (
    <>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={25}
          rowSelection={false}
          sx={{maxHeight: '70vh', minHeight: '20vh'}}
        />
      </DialogContent>
    </>
  );
};

export default UploadDialogConfirm;
