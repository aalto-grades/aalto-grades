// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Add, ExpandMore} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import type {
  GridColDef,
  GridRowClassNameParams,
  GridRowModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
// import * as fs from 'fs';
import {enqueueSnackbar} from 'notistack';
import {type ParseResult, parse, unparse} from 'papaparse';
import {type Dispatch, type JSX, type SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {read, utils, writeFile} from 'xlsx';

import type {CoursePartData} from '@/common/types';
import Dialog from '@/components/shared/Dialog';
import StyledDataGrid from '@/components/shared/StyledDataGrid';
import MismatchDialog, {type MismatchData} from './MismatchDialog';
import type {GradeUploadColTypes} from './UploadDialog';

// Set internal fs instance for xlsx
// setFs(fs);

type ParsedImportData = ParseResult<string[]>;

// Wrap parse into an async function to be able to await
const parseCsv = async (csvData: string | File): Promise<ParsedImportData> =>
  new Promise((resolve) => {
    parse(csvData, {
      skipEmptyLines: true,
      complete: resolve,
    });
  });

const parseExcel = async (loadedData: File): Promise<ParsedImportData> => {
  const data = await loadedData.arrayBuffer();
  const workbook = read(data);
  // Processes only the first sheet, should we loop all sheets to the final result?
  const csv = utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]], {
    FS: ',',
  });
  const parsed = parseCsv(csv);
  return parsed;
};

type PropsType = {
  coursePart: CoursePartData | null;
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
  coursePart,
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
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const DataGridToolbar = (): JSX.Element => {
    const handleClick = (): void => {
      setRows((oldRows) => {
        const freeId = Math.max(0, ...oldRows.map(row => row.id)) + 1;
        const newRow = {id: freeId} as GradeUploadColTypes;
        for (const column of columns) {
          if (column.field === 'studentNo') newRow[column.field] = '-';
          else newRow[column.field] = 0;
        }
        return oldRows.concat(newRow);
      });
    };
    return (
      <Toolbar>
        <Button startIcon={<Add />} onClick={handleClick}>
          {t('general.add-row')}
        </Button>
      </Toolbar>
    );
  };

  const downloadTemplate = (type: 'csv' | 'excel'): void => {
    const data = unparse([
      columns.filter(col => col.field !== 'actions').map(col => col.field),
    ]);

    if (type === 'excel') {
      const ws = utils.aoa_to_sheet([data.split(',')]);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Sheet1');
      writeFile(wb, 'template.xlsx');
    } else {
      const fileBlob = new Blob([data], {type: 'text/csv'});

      const linkElement = document.createElement('a');
      linkElement.href = URL.createObjectURL(fileBlob);
      linkElement.download = 'template.csv';
      document.body.append(linkElement);
      linkElement.click();
      linkElement.remove();
    }
  };

  /** Read data using uploaded data key to course part keyMap */
  const readData = (
    dataRows: string[][],
    columnKeys: string[],
    keyMap: {[key: string]: string}
  ): GridRowModel<GradeUploadColTypes>[] => {
    const newRows = [];
    let missingData = false;
    for (let rowI = 0; rowI < dataRows.length; rowI++) {
      const csvRow = dataRows[rowI];
      // Skip first row (titles) & empty rows
      if (rowI === 0 || csvRow.length === 0) continue;

      const rowData = {id: rowI} as GradeUploadColTypes;
      for (let i = 0; i < csvRow.length; i++) {
        const value = csvRow[i].trim();

        // Check column type
        const columnKey = keyMap[columnKeys[i]];
        if (columnKey === 'ignoreColumn') continue;
        if (columnKey === 'studentNo') {
          rowData.studentNo = value;
          continue;
        }

        // Task grade column
        if (value !== '') {
          rowData[columnKey] = parseInt(value);
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

  const loadFile = async (loadedData: string | File): Promise<void> => {
    let dataRows: ParsedImportData | null = null;

    if (typeof loadedData !== 'string') {
      const fileName = loadedData.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension && ['xls', 'xlsx'].includes(fileExtension)) {
        dataRows = await parseExcel(loadedData);
      }
    }

    if (dataRows === null) {
      dataRows = await parseCsv(loadedData);
    }

    const columnKeys = dataRows.data[0].map(value => value.toString());
    const courseTasks = columns
      .filter(col => col.field !== 'actions')
      .map(col => col.field);

    // Try to match the loaded data columns with course task names
    let mismatches = false;
    let studentNoFound = false;
    const keyMaps: {[key: string]: string} = {};

    for (const key of columnKeys) {
      if (key.toLowerCase() === 'studentno') studentNoFound = true;
      const matchingField = courseTasks.find(
        task => task.toLowerCase() === key.toLowerCase()
      );
      if (matchingField === undefined) mismatches = true;
      else keyMaps[key] = matchingField;
    }

    if (mismatches || !studentNoFound) {
      setMismatchDialogOpen(true);
      setMismatchData({
        columnKeys,
        courseTasks,
        onImport: (keyMap) => {
          setMismatchDialogOpen(false);
          setRows(readData(dataRows.data, columnKeys, keyMap));
          setEditText(true);
          setExpanded('edit');
        },
      });
    } else {
      setRows(readData(dataRows.data, columnKeys, keyMaps));
      setEditText(true);
      setExpanded('edit');
    }
  };

  // Set row className if errors
  const getRowClassName = (
    params: GridRowClassNameParams<GridValidRowModel>
  ): string => {
    const hasInvalid = Object.entries(params.row).some(([key, value]) => {
      const maxGrade = maxGrades[key] as number | undefined | null;
      return (
        maxGrade !== undefined
        && maxGrade !== null
        && value
        && (value as number) > maxGrade
      );
    });
    return hasInvalid ? 'invalid-value-data-grid' : '';
  };

  return (
    <>
      <DialogTitle>
        {t('course.results.upload.upload-grades-to-part', {
          part: coursePart?.name,
        })}
      </DialogTitle>
      <Dialog
        open={textFieldOpen}
        onClose={() => setTextFieldOpen(false)}
        fullWidth
      >
        <DialogTitle>{t('course.results.upload.paste-text')}</DialogTitle>
        <DialogContent>
          <TextField
            placeholder={t('course.results.upload.paste-text-placeholder')}
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
              loadFile(textFieldText);
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
          mismatchData ?? {columnKeys: [], courseTasks: [], onImport: () => {}}
        }
      />

      <DialogContent sx={{minHeight: 500}}>
        <Collapse in={invalidValues}>
          <Alert severity="warning" sx={{mb: 2}}>
            {t('course.results.upload.higher-than-max')}
          </Alert>
        </Collapse>
        <Accordion
          expanded={expanded === 'upload'}
          onChange={(_, newExpanded) =>
            setExpanded(newExpanded ? 'upload' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {t('course.results.upload.upload-grades')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
              <Box>
                <Typography variant="body1">
                  {t('course.results.upload.upload-button-group-title')}
                </Typography>
                <ButtonGroup>
                  <Button component="label" variant="outlined">
                    {t('course.results.upload.upload-file')}
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      hidden
                      onChange={(e) => {
                        if (e.target.files !== null)
                          loadFile(e.target.files[0]);
                      }}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setTextFieldOpen(true)}
                  >
                    {t('course.results.upload.paste-text')}
                  </Button>
                </ButtonGroup>
              </Box>
              <Box>
                <Typography variant="body1">
                  {t('course.results.upload.download-button-group-title')}
                </Typography>
                <ButtonGroup>
                  <Button
                    variant="outlined"
                    onClick={() => downloadTemplate('csv')}
                  >
                    {t('course.results.upload.download-csv-template')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => downloadTemplate('excel')}
                  >
                    {t('course.results.upload.download-excel-template')}
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'edit'}
          onChange={(_, newExpanded) => setExpanded(newExpanded ? 'edit' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {editText
                ? t('general.edit')
                : t('course.results.upload.add-manually')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '40vh'}}>
              <StyledDataGrid
                rows={rows}
                columns={columns}
                rowHeight={25}
                editMode="row"
                rowSelection={false}
                disableColumnSelector
                showToolbar
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
                processRowUpdate={(updatedRow: GradeUploadColTypes) => {
                  setRows(oldRows =>
                    oldRows.map(row =>
                      row.id === updatedRow.id ? updatedRow : row
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
