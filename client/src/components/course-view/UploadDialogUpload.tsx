// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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
  GridRowModel,
  GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {ParseResult, parse, unparse} from 'papaparse';
import {Dispatch, JSX, SetStateAction, useEffect, useState} from 'react';

import {GradeUploadColTypes} from './UploadDialog';
import MismatchDialog, {MismatchData} from './UploadDialogMismatchDialog';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp<GradeUploadColTypes>;
  setRows: Dispatch<SetStateAction<GridRowsProp<GradeUploadColTypes>>>;
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
}: PropsType): JSX.Element => {
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

  const dataGridToolbar = (): JSX.Element => {
    const handleClick = (): void => {
      setRows(oldRows => {
        const freeId =
          oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
        const fieldValues: GradeUploadColTypes = {
          id: freeId,
        } as GradeUploadColTypes;
        for (const column of columns) {
          if (column.field === 'studentNo') fieldValues[column.field] = '-';
          else fieldValues[column.field] = 0;
        }
        return oldRows.concat(fieldValues);
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

  const downloadTemplate = (): void => {
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

  /** Read data using csv key to course part key map */
  const readCSVData = (
    csvRows: (string | number)[][],
    csvKeys: string[],
    keyMap: {[key: string]: string}
  ): GridRowModel<GradeUploadColTypes>[] => {
    const newRows = [];
    let missingData = false;
    for (let rowI = 0; rowI < csvRows.length; rowI++) {
      const csvRow = csvRows[rowI];
      if (rowI === 0 || csvRow.length === 0) continue;

      const rowData = {id: rowI} as GradeUploadColTypes;
      for (let i = 0; i < csvRow.length; i++) {
        const columnKey = keyMap[csvKeys[i]];
        if (columnKey === 'ignoreColumn') continue;
        if (columnKey === 'studentNo') {
          rowData.studentNo = csvRow[i].toString();
          continue;
        }
        const value = csvRow[i];
        if (typeof value === 'number') {
          rowData[columnKey] = value;
        } else {
          // Missing data
          missingData = true;
          rowData[columnKey] = null;
        }
      }
      newRows.push(rowData);
    }
    if (missingData) {
      enqueueSnackbar('Some students have missing grades', {
        variant: 'warning',
      });
    }
    return newRows;
  };

  const loadCsv = (csvData: string | File): void => {
    parse(csvData, {
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (csvRows: ParseResult<(string | number)[]>) => {
        const fields = columns.map(col => col.field);
        const csvKeys = csvRows.data[0].map(value => value.toString());

        // Find matching keys
        let mismatches = false;
        let studentNoFound = false;
        const csvKeyMap: {[key: string]: string} = {};
        for (const key of csvKeys) {
          if (key.toLowerCase() === 'studentno') studentNoFound = true;
          const matchingField = fields.find(
            field => field.toLowerCase() === key.toLowerCase()
          );
          if (matchingField === undefined) mismatches = true;
          else csvKeyMap[key] = matchingField;
        }

        if (mismatches || !studentNoFound) {
          setMismatchDialogOpen(true);
          setMismatchData({
            fields: fields.filter(field => field !== 'actions'),
            keys: csvKeys,
            onImport: (keyMap: {[key: string]: string}) => {
              setMismatchDialogOpen(false);
              setRows(readCSVData(csvRows.data, csvKeys, keyMap));
              setEditText(true);
              setExpanded('edit');
            },
          });
        } else {
          setRows(readCSVData(csvRows.data, csvKeys, csvKeyMap));
          setEditText(true);
          setExpanded('edit');
        }
      },
    });
  };

  return (
    <>
      <DialogTitle>Upload grades</DialogTitle>
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
          mismatchData ?? {fields: [], keys: [], onImport: () => {}}
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
          onChange={(_, newExpanded) =>
            setExpanded(newExpanded ? 'upload' : '')
          }
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Upload grades
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
                Download CSV template
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
          onChange={(_, newExpanded) => setExpanded(newExpanded ? 'edit' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            {editText ? 'Edit' : 'Or add them manually'}
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '40vh'}}>
              <DataGrid
                // autoHeight
                rows={rows}
                columns={columns}
                rowHeight={25}
                editMode="row"
                rowSelection={false}
                disableColumnSelector
                slots={{toolbar: dataGridToolbar}}
                onRowEditStart={() => setEditing(true)}
                onRowEditStop={() => setEditing(false)}
                processRowUpdate={(
                  updatedRow: GridRowModel<GradeUploadColTypes>
                ) => {
                  setRows(oldRows =>
                    oldRows.map(row =>
                      row.id === updatedRow.id ? updatedRow : row
                    )
                  );

                  if (updatedRow.studentNo === '')
                    throw new Error('Student number cannot be empty');

                  setError(false);
                  return updatedRow;
                }}
                onProcessRowUpdateError={(rowError: Error) => {
                  setError(true);
                  enqueueSnackbar(rowError.message, {variant: 'error'});
                }}
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogUpload;
