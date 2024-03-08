import {Delete} from '@mui/icons-material';
import {Button, Dialog, DialogActions} from '@mui/material';
import {GridActionsCellItem, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import UploadDialogConfirm from './UploadDialogConfirm';
import UploadDialogUpload from './UploadDialogUpload';

const UploadDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    if (open) {
      // reset
      setCurrentStep(0);
      setRows([]);
    }
  }, [open]);

  const columns: GridColDef[] = [
    {
      field: 'studentNo',
      headerName: 'Student Number',
      type: 'string',
      width: 120,
      editable: true,
    },
    {field: 'tierA', headerName: 'Tier A', type: 'number', editable: true},
    {field: 'tierB', headerName: 'Tier B', type: 'number', editable: true},
    {field: 'tierC', headerName: 'Tier C', type: 'number', editable: true},
    {
      field: 'actions',
      type: 'actions',
      getActions: params => [
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() =>
            setRows(oldRows => oldRows.filter(row => row.id !== params.id))
          }
        />,
      ],
    },
  ];
  const readOnlycolumns: GridColDef[] = [
    {
      field: 'studentNo',
      headerName: 'Student Number',
      type: 'string',
    },
    {field: 'tierA', headerName: 'Tier A', type: 'number'},
    {field: 'tierB', headerName: 'Tier B', type: 'number'},
    {field: 'tierC', headerName: 'Tier C', type: 'number'},
  ];

  const onSubmit = () => {
    console.log(rows);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      {currentStep === 0 ? (
        <UploadDialogUpload columns={columns} rows={rows} setRows={setRows} />
      ) : (
        <UploadDialogConfirm columns={readOnlycolumns} rows={rows} />
      )}

      <DialogActions>
        {currentStep === 1 && (
          <Button
            onClick={() => setCurrentStep(cur => cur - 1)}
            sx={{mr: 'auto'}}
          >
            Back
          </Button>
        )}
        {currentStep === 0 && (
          <Button
            onClick={() => setCurrentStep(cur => cur + 1)}
            disabled={rows.length === 0}
          >
            Next
          </Button>
        )}
        {currentStep === 1 && (
          <Button
            onClick={() => {
              onClose();
              onSubmit();
            }}
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default UploadDialog;
