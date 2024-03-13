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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

type MismatchData = {
  fields: string[];
  keys: string[];
  mismatches: string[];
  onImport: (keyMap: {[key: string]: string}) => void;
};

const BadFieldDialog = ({
  open,
  onClose,
  mismatchData,
}: {
  open: boolean;
  onClose: () => void;
  mismatchData: MismatchData;
}) => {
  const [selections, setSelections] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<'' | 'empty' | 'duplicate'>('');
  const [duplicate, setDuplicate] = useState<string>('');

  useEffect(() => {
    const newSelections = {...selections};
    for (const key of mismatchData.keys) {
      if (mismatchData.mismatches.includes(key)) continue;
      newSelections[key] = mismatchData.fields.find(
        field => field.toLowerCase() === key.toLowerCase()
      ) as string;
    }
    setSelections(newSelections);
  }, [mismatchData.fields, mismatchData.keys, mismatchData.mismatches]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    for (const key of mismatchData.keys) {
      if (!(key in selections)) {
        setError('empty');
        return;
      }
    }
    const usedSelections: string[] = [];
    for (const value of Object.values(selections)) {
      if (usedSelections.includes(value) && value !== 'Ignore Column') {
        setError('duplicate');
        setDuplicate(value);
        return;
      }
      usedSelections.push(value);
    }
    setError('');
  }, [mismatchData.keys, selections]);

  return (
    <Dialog open={open && mismatchData !== null} fullWidth onClose={onClose}>
      <DialogTitle>Mismatching columns found</DialogTitle>
      <DialogContent>
        <Alert severity={error !== '' ? 'error' : 'success'} sx={{mb: 2}}>
          {error === ''
            ? 'All Done!'
            : error === 'empty'
            ? '"Import as" field cannot be empty'
            : 'The same import as value cannot appear twice'}
        </Alert>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>CSV column</TableCell>
                <TableCell>Import as</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mismatchData.keys.map(key => (
                <TableRow key={`mismatch-${key}`}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <FormControl
                      error={
                        (error === 'empty' && selections[key] === undefined) ||
                        (error === 'duplicate' && selections[key] === duplicate)
                      }
                    >
                      <InputLabel id={`mismatch-select${key}`}>
                        Import as
                      </InputLabel>
                      <Select
                        labelId={`mismatch-select${key}`}
                        label="Import as"
                        size="small"
                        value={selections[key] ?? ''}
                        onChange={e =>
                          setSelections(oldSelections => ({
                            ...oldSelections,
                            [key]: e.target.value,
                          }))
                        }
                        sx={{minWidth: 200}}
                      >
                        {mismatchData.fields.map((field, index) => (
                          <MenuItem
                            key={`mismatch-${key}-select-${field}`}
                            value={field}
                            divider={
                              index === 0 ||
                              index === mismatchData.fields.length - 1
                            }
                          >
                            {field}
                          </MenuItem>
                        ))}
                        <MenuItem key="Ignore Column" value="Ignore Column">
                          Ignore Column
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => mismatchData.onImport(selections)}
          disabled={error !== ''}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: Dispatch<SetStateAction<GridRowsProp>>;
  setReady: Dispatch<SetStateAction<boolean>>;
};
const UploadDialogUpload = ({columns, rows, setRows, setReady}: PropsType) => {
  const [textFieldText, setTextFieldText] = useState<string>('');
  const [textFieldOpen, setTextFieldOpen] = useState<boolean>(false);
  const [mismatchDialogOpen, setMismatchDialogOpen] = useState<boolean>(false);
  const [mismatchData, setMismatchData] = useState<MismatchData | null>(null);
  const [expanded, setExpanded] = useState<'' | 'import' | 'edit'>(
    rows.length > 0 ? 'edit' : 'import'
  );
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
    const element = document.createElement('a');
    const file = new Blob([data], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'template.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTextFieldOpen(false);
              loadCsv(textFieldText);
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <BadFieldDialog
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
          expanded={expanded === 'import'}
          onChange={(_, expanded) => setExpanded(expanded ? 'import' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Import Grades
          </AccordionSummary>
          <AccordionDetails>
            <ButtonGroup>
              <Button component="label" variant="outlined">
                Import CSV
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
