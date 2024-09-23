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
import {type JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

export type MismatchData = {
  csvKeys: string[];
  courseTasks: string[];
  onImport: (keyMap: {[key: string]: string}) => void;
};
type MismatchError = '' | 'empty' | 'duplicate' | 'noStudentNo';
type Selections = {[key: string]: string | null};

type PropsType = {
  open: boolean;
  onClose: () => void;
  mismatchData: MismatchData;
};
const MismatchDialog = ({
  open,
  onClose,
  mismatchData,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [selections, setSelections] = useState<Selections>({});
  const [error, setError] = useState<MismatchError>('');
  const [duplicate, setDuplicate] = useState<string>('');

  const [oldMismatchData, setOldMismatchData] = useState<MismatchData | null>(
    null
  );
  if (mismatchData !== oldMismatchData) {
    setOldMismatchData(mismatchData);

    // Set new selections and try to match some keys.
    const newSelections: Selections = {};
    for (const key of mismatchData.csvKeys) {
      const matchingTask = mismatchData.courseTasks.find(
        task => task.toLowerCase() === key.toLowerCase()
      );
      if (matchingTask) newSelections[key] = matchingTask;
      else newSelections[key] = null;
    }
    setSelections(newSelections);
  }

  // Find errors
  useEffect(() => {
    // Empty target
    const emptyTarget = Object.values(selections).some(
      target => target === null
    );
    if (emptyTarget) {
      setError('empty');
      return;
    }

    // Duplicate field
    const usedSelections: string[] = [];
    for (const target of Object.values(selections)) {
      if (usedSelections.includes(target!) && target !== 'ignoreColumn') {
        setError('duplicate');
        setDuplicate(target!);
        return;
      }
      usedSelections.push(target!);
    }

    // Student number field not found
    const studentNumberTarget = Object.values(selections).some(
      target => target === 'studentNo'
    );
    if (!studentNumberTarget) {
      setError('noStudentNo');
      return;
    }

    setError('');
  }, [mismatchData.csvKeys, selections]);

  const getErrorText = (): string => {
    switch (error) {
      case '':
        return t('course.results.upload.all-done');
      case 'duplicate':
        return t('course.results.upload.import-as-twice');
      case 'empty':
        return t('course.results.upload.import-as-empty');
      case 'noStudentNo':
        return t('course.results.upload.no-student-number');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('course.results.upload.mismatch')}</DialogTitle>
      <DialogContent>
        <Alert severity={error !== '' ? 'error' : 'success'} sx={{mb: 2}}>
          {getErrorText()}
        </Alert>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('course.results.upload.csv-column')}</TableCell>
                <TableCell>{t('course.results.upload.import-as')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(selections).map(([key, target]) => (
                <TableRow
                  key={key}
                  sx={{
                    background: target === 'ignoreColumn' ? '#eceff1' : '',
                  }}
                >
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <FormControl
                      sx={{background: 'white'}}
                      error={
                        (error === 'empty' && target === null) ||
                        (error === 'duplicate' && target === duplicate)
                      }
                    >
                      <InputLabel id={`mismatch-select-${key}`}>
                        {t('course.results.upload.import-as')}
                      </InputLabel>
                      <Select
                        labelId={`mismatch-select-${key}`}
                        label={t('course.results.upload.import-as')}
                        size="small"
                        value={target ?? ''}
                        onChange={e =>
                          setSelections(oldSelections => ({
                            ...oldSelections,
                            [key]: e.target.value,
                          }))
                        }
                        sx={{minWidth: 200}}
                      >
                        {mismatchData.courseTasks.map((task, index) => (
                          <MenuItem
                            key={task}
                            value={task}
                            divider={
                              index === 0 ||
                              index === mismatchData.courseTasks.length - 1
                            }
                          >
                            {task}
                          </MenuItem>
                        ))}
                        <MenuItem key="ignoreColumn" value="ignoreColumn">
                          {t('course.results.upload.ignore-column')}
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
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button
          onClick={() =>
            mismatchData.onImport(selections as {[key: string]: string})
          }
          variant="contained"
          disabled={error !== ''}
        >
          {t('general.import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MismatchDialog;
