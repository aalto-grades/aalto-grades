// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en-gb';

import {ExpandMore} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Checkbox,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type {
  GridColDef,
  GridRowClassNameParams,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import type {Dayjs} from 'dayjs';
import {
  type Dispatch,
  type JSX,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';

import LocalizedDatePicker from '@/components/shared/LocalizedDatePicker';
import StyledDataGrid from '@/components/shared/StyledDataGrid';
import DateDialog from './DateDialog';
import type {GradeUploadColTypes} from './UploadDialog';

export type DateType = {
  courseTaskName: string;
  completionDate: Dayjs;
  expirationDate: Dayjs | null;
};

type CoursePartDate = 'expiration' | 'completion';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp<GradeUploadColTypes>;
  maxGrades: {[key: string]: number | null};
  setReady: Dispatch<SetStateAction<boolean>>;
  dates: DateType[];
  setDates: Dispatch<SetStateAction<DateType[]>>;
  expanded: '' | 'date' | 'confirm';
  setExpanded: Dispatch<SetStateAction<'' | 'date' | 'confirm'>>;
  invalidValues: boolean;
};

const UploadDialogConfirm = ({
  columns,
  rows,
  maxGrades,
  setReady,
  dates,
  setDates,
  expanded,
  setExpanded,
  invalidValues,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [error, setError] = useState<boolean>(false);
  const [editCompletionDates, setEditCompletionDates] = useState<string[]>([]);
  const [editExpirationDates, setEditExpirationDates] = useState<string[]>([]);
  const [bulkEdit, setBulkEdit] = useState<null | {
    type: CoursePartDate;
    courseTaskNames: string[];
  }>(null);

  const nonEmptyCols = useMemo(() => {
    const newNonEmptyCols: string[] = [];
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (key === 'id' || key === 'StudentNo' || value === null) continue;
        if (!newNonEmptyCols.includes(key)) newNonEmptyCols.push(key);
      }
    }
    return newNonEmptyCols;
  }, [rows]);

  // Check for errors
  useEffect(() => {
    let newError = false;
    for (const date of dates) {
      if (date.expirationDate && date.expirationDate <= date.completionDate)
        newError = true;
    }
    if (newError !== error) {
      setError(newError);
      if (newError) setReady(false);
      else setReady(true);
    }
  }, [dates, error, setReady]);

  const handleCompletionDateChange = (
    newCompletionDate: Dayjs | null,
    coursePartName: string
  ): void => {
    if (newCompletionDate === null) return;

    // Move expiration date the same amount as the new date
    setDates(oldDates =>
      oldDates.map(oldDate =>
        oldDate.courseTaskName === coursePartName
          ? {
              ...oldDate,
              completionDate: newCompletionDate,
              expirationDate:
                oldDate.expirationDate?.add(
                  newCompletionDate.diff(oldDate.completionDate)
                ) ?? null,
            }
          : oldDate
      )
    );
  };

  // Set row class name if errors
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

  const closeBulkEdit = (): void => {
    setBulkEdit(null);
  };

  const handleClick = (type: CoursePartDate): void => {
    setBulkEdit({
      type,
      courseTaskNames:
        type === 'completion' ? editCompletionDates : editExpirationDates,
    });
  };

  const handleDateChange = (date: Dayjs): void => {
    if (bulkEdit === null) return;

    if (bulkEdit.type === 'completion') {
      bulkEdit.courseTaskNames.forEach(data =>
        handleCompletionDateChange(date, data)
      );
    } else {
      bulkEdit.courseTaskNames.forEach(data => {
        setDates(oldDates =>
          oldDates.map(oldDate =>
            oldDate.courseTaskName === data
              ? {
                  ...oldDate,
                  expirationDate: date,
                }
              : oldDate
          )
        );
      });
    }

    closeBulkEdit();
  };

  const colDates = dates.filter(date =>
    nonEmptyCols.includes(date.courseTaskName)
  );

  const selectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
    setValues: (value: SetStateAction<string[]>) => void
  ): void => {
    if (event.target.checked) {
      setValues(colDates.map(val => val.courseTaskName));
    } else {
      setValues([]);
    }
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    values: string[],
    setValues: (value: SetStateAction<string[]>) => void
  ): void => {
    if (values.includes(event.target.value)) {
      setValues(prev => prev.filter(val => val !== event.target.value));
    } else {
      setValues(prev => [event.target.value, ...prev]);
    }
  };

  const DateTable = (): JSX.Element => (
    <>
      <DateDialog
        open={bulkEdit !== null}
        close={closeBulkEdit}
        submit={handleDateChange}
      />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('general.course-part')}</TableCell>
              <TableCell>
                {colDates.length > 1 && (
                  <Checkbox
                    onChange={e => selectAll(e, setEditCompletionDates)}
                    checked={colDates.length === editCompletionDates.length}
                  />
                )}
                {t('course.results.upload.completion-date')}
                {colDates.length > 1 && (
                  <Button
                    disabled={editCompletionDates.length === 0}
                    sx={{ml: 2}}
                    size="small"
                    variant="outlined"
                    onClick={() => handleClick('completion')}
                  >
                    {t('course.results.upload.modify-selected')}
                  </Button>
                )}
              </TableCell>
              <TableCell>
                {colDates.length > 1 && (
                  <Checkbox
                    onChange={e => selectAll(e, setEditExpirationDates)}
                    checked={colDates.length === editExpirationDates.length}
                  />
                )}
                {t('course.results.upload.expiration-date')}
                {colDates.length > 1 && (
                  <Button
                    disabled={editExpirationDates.length === 0}
                    sx={{ml: 2}}
                    size="small"
                    variant="outlined"
                    onClick={() => handleClick('expiration')}
                  >
                    {t('course.results.upload.modify-selected')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colDates.map(date => (
              <TableRow key={date.courseTaskName}>
                <TableCell>{date.courseTaskName}</TableCell>
                <TableCell>
                  {colDates.length > 1 && (
                    <Checkbox
                      value={date.courseTaskName}
                      onChange={e =>
                        handleCheckboxClick(
                          e,
                          editCompletionDates,
                          setEditCompletionDates
                        )
                      }
                      checked={editCompletionDates.includes(
                        date.courseTaskName
                      )}
                    />
                  )}
                  <LocalizedDatePicker
                    slotProps={{textField: {size: 'small'}}}
                    value={date.completionDate}
                    onChange={value =>
                      handleCompletionDateChange(value, date.courseTaskName)
                    }
                  />
                </TableCell>
                <TableCell>
                  {colDates.length > 1 && (
                    <Checkbox
                      value={date.courseTaskName}
                      onChange={e =>
                        handleCheckboxClick(
                          e,
                          editExpirationDates,
                          setEditExpirationDates
                        )
                      }
                      checked={editExpirationDates.includes(
                        date.courseTaskName
                      )}
                    />
                  )}
                  <LocalizedDatePicker
                    minDate={date.completionDate}
                    disabled={date.expirationDate === null && false}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error:
                          date.expirationDate !== null &&
                          date.expirationDate <= date.completionDate,
                        helperText:
                          date.expirationDate !== null &&
                          date.expirationDate <= date.completionDate
                            ? t(
                                'course.results.upload.expiration-after-completion'
                              )
                            : '',
                      },
                    }}
                    value={date.expirationDate}
                    onChange={e =>
                      setDates(oldDates =>
                        oldDates.map(oldDate =>
                          oldDate.courseTaskName === date.courseTaskName &&
                          e !== null
                            ? {...oldDate, expirationDate: e}
                            : oldDate
                        )
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <>
      <DialogTitle>{t('general.confirm')}</DialogTitle>
      <DialogContent>
        {invalidValues && (
          <Alert severity="warning" sx={{mb: 2}}>
            {t('course.results.upload.higher-than-max')}
          </Alert>
        )}
        <Accordion
          expanded={expanded === 'date'}
          onChange={(_, newExpanded) => setExpanded(newExpanded ? 'date' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {t('course.results.upload.dates')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {dates.length > nonEmptyCols.length && (
              <Alert severity="info" sx={{mb: 1}}>
                {t('course.results.upload.hidden')}
              </Alert>
            )}
            <DateTable />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'confirm'}
          onChange={(_, newExpanded) =>
            setExpanded(newExpanded ? 'confirm' : '')
          }
          disabled={error}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography color={error ? 'error' : undefined} variant="h6">
              {t('course.results.upload.confirm-data')}{' '}
              {error && `(${t('course.results.upload.resolve-errors')})`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '70vh'}}>
              {!error && (
                <StyledDataGrid
                  rows={rows}
                  columns={columns}
                  rowHeight={25}
                  rowSelection={false}
                  disableColumnSelector
                  getRowClassName={getRowClassName}
                />
              )}
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogConfirm;
