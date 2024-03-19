import {Add, ExpandMore} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {parse, unparse} from 'papaparse';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import MismatchDialog, {MismatchData} from './UploadDialogMismatchDialog';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: Dispatch<SetStateAction<GridRowsProp>>;
  setReady: Dispatch<SetStateAction<boolean>>;
  expanded: '' | 'upload' | 'edit';
  setExpanded: Dispatch<SetStateAction<'' | 'upload' | 'edit'>>;
};

const UploadDialogUpload = ({
  columns,
  rows,
  setRows,
  setReady,
  expanded,
  setExpanded,
}: PropsType) => {
  const [textFieldText, setTextFieldText] = useState<string>('');
  const [textFieldOpen, setTextFieldOpen] = useState<boolean>(false);
  const [mismatchDialogOpen, setMismatchDialogOpen] = useState<boolean>(false);
  const [mismatchData, setMismatchData] = useState<MismatchData | null>(null);
  const [editText, setEditText] = useState<boolean>(rows.length > 0);
  const [snackbar, setSnackBar] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (error || editing) setReady(false);
    else setReady(true);
  }, [error, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const dataGridToolbar = () => {
    const handleClick = () => {
      setRows(oldRows => {
        const freeId =
          oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
        const fieldValues: {[key: string]: string | number} = {};
        for (const column of columns)
          fieldValues[column.field] = column.type === 'string' ? '-' : 0;
        return oldRows.concat({id: freeId, ...fieldValues});
      });
    };
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={handleClick}>
          Add row
        </Button>
      </GridToolbarContainer>
    );
  };

  const downloadTemplate = () => {
    const data = unparse([
      columns.filter(col => col.field !== 'actions').map(col => col.field),
    ]);
    const fileBlob = new Blob([data], {type: 'text/csv'});

    const linkElement = document.createElement('a');
    linkElement.href = URL.createObjectURL(fileBlob);
    linkElement.download = 'template.csv';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const loadCsv = (csvData: string | File): void => {
    parse(csvData, {
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (rows: {data: string[][]}) => {
        const fields = columns.map(col => col.field);
        const resultKeys = rows.data[0];

        const mismatches: string[] = [];
        const keyMap: {[key: string]: string} = {};
        for (const key of resultKeys) {
          const matchingField = fields.find(
            field => field.toLowerCase() === key.toLowerCase()
          );
          if (matchingField === undefined) mismatches.push(key);
          else keyMap[key] = matchingField;
        }

        const getData = (keyMap: {
          [key: string]: string;
        }): {[key: string]: string}[] => {
          const newRows = [];
          for (let rowI = 0; rowI < rows.data.length; rowI++) {
            if (rowI === 0 || rows.data[rowI].length === 0) continue;

            const rowData: GridValidRowModel = {id: rowI};
            for (let i = 0; i < rows.data[rowI].length; i++) {
              if (keyMap[resultKeys[i]] === 'Ignore Column') continue;
              rowData[keyMap[resultKeys[i]]] = rows.data[rowI][i];
            }
            newRows.push(rowData);
          }
          return newRows;
        };

        if (mismatches.length > 0) {
          setMismatchDialogOpen(true);
          setMismatchData({
            fields: fields.filter(field => field !== 'actions'),
            keys: resultKeys,
            mismatches,
            onImport: (keyMap: {[key: string]: string}) => {
              setMismatchDialogOpen(false);
              setRows(getData(keyMap));
              setEditText(true);
              setExpanded('edit');
            },
          });
        } else {
          setRows(getData(keyMap));
          setEditText(true);
          setExpanded('edit');
        }
      },
    });
  };

  return (
    <>
      <DialogTitle>Upload Grades</DialogTitle>
      <Dialog
        open={textFieldOpen}
        fullWidth
        onClose={() => setTextFieldOpen(false)}
      >
        <DialogTitle>Paste text</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={15}
            fullWidth
            onChange={e => setTextFieldText(e.target.value)}
            value={textFieldText}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTextFieldOpen(false);
              setTextFieldText('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setTextFieldOpen(false);
              loadCsv(textFieldText);
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <MismatchDialog
        open={mismatchDialogOpen}
        onClose={() => setMismatchDialogOpen(false)}
        mismatchData={
          mismatchData ?? {
            fields: [],
            keys: [],
            mismatches: [],
            onImport: () => {},
          }
        }
      />

      <DialogContent sx={{minHeight: 500}}>
        <Snackbar
          open={snackbar !== null}
          autoHideDuration={3000}
          onClose={() => setSnackBar(null)}
        >
          <Alert
            severity={snackbar?.severity}
            onClose={() => setSnackBar(null)}
          >
            {snackbar?.message}
          </Alert>
        </Snackbar>
        <Accordion
          expanded={expanded === 'upload'}
          onChange={(_, expanded) => setExpanded(expanded ? 'upload' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Upload Grades
          </AccordionSummary>
          <AccordionDetails>
            <ButtonGroup>
              <Button component="label" variant="outlined">
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={e => {
                    if (e.target.files !== null) loadCsv(e.target.files[0]);
                  }}
                />
              </Button>
              <Button variant="outlined" onClick={downloadTemplate}>
                Download CSV Template
              </Button>
              <Button variant="outlined">Import from SISU</Button>
              <Button variant="outlined">Import from MyCourses</Button>
              <Button variant="outlined" onClick={() => setTextFieldOpen(true)}>
                Paste text
              </Button>
            </ButtonGroup>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'edit'}
          onChange={(_, expanded) => setExpanded(expanded ? 'edit' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            {editText ? 'Edit' : 'Or add them manually'}
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={25}
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              slots={{toolbar: dataGridToolbar}}
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              processRowUpdate={updatedRow => {
                setRows(oldRows =>
                  oldRows.map(row =>
                    row.id === updatedRow.id ? updatedRow : row
                  )
                );
                // TODO: do some validation. Code below is an example.
                // for (const [key, val] of Object.entries(updatedRow)) {
                //   if (key === 'id' || key === 'StudentNo') continue;
                //   if ((val as number) < 0)
                //     throw new Error('Value cannot be negative');
                //   else if ((val as number) > 5000)
                //     throw new Error('Value cannot be over 5000');
                // }
                // setSnackBar({message: 'Row saved!', severity: 'success'});
                setError(false);
                return updatedRow;
              }}
              onProcessRowUpdateError={error => {
                setError(true);
                setSnackBar({message: error.message, severity: 'error'});
              }}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogUpload;
