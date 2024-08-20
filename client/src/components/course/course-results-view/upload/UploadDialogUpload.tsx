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
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import {
  GridColDef,
  GridRowClassNameParams,
  GridRowModel,
  GridRowsProp,
  GridToolbarContainer,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {ParseResult, parse, unparse} from 'papaparse';
import {Dispatch, JSX, SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';

import StyledDataGrid from '@/components/shared/StyledDataGrid';
import AplusImportDialog from './AplusImportDialog';
import {GradeUploadColTypes} from './UploadDialog';
import MismatchDialog, {MismatchData} from './UploadDialogMismatchDialog';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp<GradeUploadColTypes>;
  maxGrades: {[key: string]: number | null};
  setRows: Dispatch<SetStateAction<GridRowsProp<GradeUploadColTypes>>>;
  setReady: Dispatch<SetStateAction<boolean>>;
  expanded: '' | 'upload' | 'edit';
  setExpanded: Dispatch<SetStateAction<'' | 'upload' | 'edit'>>;
  invalidValues: boolean;
};
const UploadDialogUpload = ({
  columns,
  rows,
  maxGrades,
  setRows,
  setReady,
  expanded,
  setExpanded,
  invalidValues,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
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
  const [aplusImportDialogOpen, setAplusImportDialogOpen] =
    useState<boolean>(false);

  const DataGridToolbar = (): JSX.Element => {
    const handleClick = (): void => {
      setRows(oldRows => {
        const freeId = Math.max(...oldRows.map(row => row.id)) + 1;
        const newRow: GradeUploadColTypes = {
          id: freeId,
        } as GradeUploadColTypes;
        for (const column of columns) {
          if (column.field === 'studentNo') newRow[column.field] = '-';
          else newRow[column.field] = 0;
        }
        return oldRows.concat(newRow);
      });
    };
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={handleClick}>
          {t('general.add-row')}
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
    document.body.append(linkElement);
    linkElement.click();
    linkElement.remove();
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
      enqueueSnackbar(t('course.results.upload.missing-grades'), {
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

  const getRowClassName = (
    params: GridRowClassNameParams<GridValidRowModel>
  ): string => {
    const hasInvalid = Object.entries(params.row).some(([key, value]) => {
      const maxGrade = maxGrades[key] as number | undefined | null;
      return (
        maxGrade !== undefined &&
        maxGrade !== null &&
        value &&
        (value as number) > maxGrade
      );
    });
    return hasInvalid ? 'invalid-value-data-grid' : '';
  };

  return (
    <>
      <DialogTitle>{t('course.results.upload.upload-grades')}</DialogTitle>
      <Dialog
        open={textFieldOpen}
        fullWidth
        onClose={() => setTextFieldOpen(false)}
      >
        <DialogTitle>{t('course.results.upload.paste-text')}</DialogTitle>
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
            {t('general.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setTextFieldOpen(false);
              loadCsv(textFieldText);
            }}
          >
            {t('general.import')}
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

      <AplusImportDialog
        handleClose={() => setAplusImportDialogOpen(false)}
        open={aplusImportDialogOpen}
      />

      <DialogContent sx={{minHeight: 500}}>
        <Collapse in={invalidValues}>
          <Alert severity="warning" sx={{mb: 2}}>
            {t('course.results.upload.higher-than-max')}
          </Alert>
        </Collapse>

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
            {t('course.results.upload.upload-grades')}
          </AccordionSummary>
          <AccordionDetails>
            <ButtonGroup>
              <Button component="label" variant="outlined">
                {t('course.results.upload.upload-csv')}
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
                {t('course.results.upload.download-template')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setAplusImportDialogOpen(true)}
              >
                {t('course.results.upload.a+-import')}
              </Button>
              <Button variant="outlined">Import from MyCourses</Button>
              <Button variant="outlined" onClick={() => setTextFieldOpen(true)}>
                {t('course.results.upload.paste-text')}
              </Button>
            </ButtonGroup>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'edit'}
          onChange={(_, newExpanded) => setExpanded(newExpanded ? 'edit' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            {editText
              ? t('general.edit')
              : t('course.results.upload.add-manually')}
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '40vh'}}>
              <StyledDataGrid
                // autoHeight
                rows={rows}
                columns={columns}
                rowHeight={25}
                editMode="row"
                rowSelection={false}
                disableColumnSelector
                slots={{toolbar: DataGridToolbar}}
                onRowEditStart={() => {
                  setEditing(true);
                  setReady(false);
                }}
                onRowEditStop={() => {
                  setEditing(false);
                  setReady(!error);
                }}
                getRowClassName={getRowClassName}
                processRowUpdate={updatedRow => {
                  setRows(oldRows =>
                    oldRows.map(row =>
                      row.id === updatedRow.id
                        ? (updatedRow as GradeUploadColTypes)
                        : row
                    )
                  );

                  if (updatedRow.studentNo === '')
                    throw new Error(
                      t('course.results.upload.student-number-empty')
                    );

                  setError(false);
                  setReady(!editing);
                  return updatedRow;
                }}
                onProcessRowUpdateError={(rowError: Error) => {
                  setError(true);
                  setReady(false);
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
