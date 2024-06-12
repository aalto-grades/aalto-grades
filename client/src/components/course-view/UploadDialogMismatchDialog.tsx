// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {JSX, useEffect, useState} from 'react';

export type MismatchData = {
  fields: string[];
  keys: string[];
  onImport: (keyMap: {[key: string]: string}) => void;
};

type MismatchError = '' | 'empty' | 'duplicate' | 'noStudentNo';

const MismatchDialog = ({
  open,
  onClose,
  mismatchData,
}: {
  open: boolean;
  onClose: () => void;
  mismatchData: MismatchData;
}): JSX.Element => {
  const [selections, setSelections] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<MismatchError>('');
  const [duplicate, setDuplicate] = useState<string>('');

  useEffect(() => {
    const newSelections: {[key: string]: string} = {};
    for (const key of mismatchData.keys) {
      const matchingField = mismatchData.fields.find(
        field => field.toLowerCase() === key.toLowerCase()
      );
      if (matchingField) newSelections[key] = matchingField;
    }
    setSelections(newSelections);
  }, [mismatchData.fields, mismatchData.keys]);

  // Find errors
  useEffect(() => {
    // Find empty
    for (const key of mismatchData.keys) {
      if (!(key in selections)) {
        setError('empty');
        return;
      }
    }

    // Find duplicates
    const usedSelections: string[] = [];
    for (const value of Object.values(selections)) {
      if (usedSelections.includes(value) && value !== 'Ignore Column') {
        setError('duplicate');
        setDuplicate(value);
        return;
      }
      usedSelections.push(value);
    }

    // Find no student number
    const found = Object.values(selections).find(key => key === 'studentNo');
    if (!found) {
      setError('noStudentNo');
      return;
    }

    setError('');
  }, [mismatchData.keys, selections]);

  const getErrorText = (): string => {
    switch (error) {
      case '':
        return 'All Done!';
      case 'duplicate':
        return 'The same "Import as" value cannot appear twice';
      case 'empty':
        return '"Import as" field cannot be empty';
      case 'noStudentNo':
        return 'Student number must be specified';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Mismatching Columns Found</DialogTitle>
      <DialogContent>
        <Alert severity={error !== '' ? 'error' : 'success'} sx={{mb: 2}}>
          {getErrorText()}
        </Alert>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>CSV Column</TableCell>
                <TableCell>Import as</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mismatchData.keys.map(key => (
                <TableRow
                  key={key}
                  sx={{
                    background:
                      selections[key] === 'Ignore Column' ? '#eceff1' : '',
                  }}
                >
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <FormControl
                      sx={{background: 'white'}}
                      error={
                        (error === 'empty' && !(key in selections)) ||
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
                            key={field}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => mismatchData.onImport(selections)}
          variant="contained"
          disabled={error !== ''}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MismatchDialog;
