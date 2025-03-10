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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox as MuiCheckbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type {
  GridColDef,
  GridRowClassNameParams,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import type {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import {enqueueSnackbar} from 'notistack';
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
import type {GradeUploadColTypes} from './UploadDialog';

export type DateType = {
  courseTaskName: string;
  completionDate: Dayjs;
  expirationDate: Dayjs | null;
};

type CoursePartDate = 'expiration' | 'completion';

const CheckAllCheckbox = ({type}: {type: CoursePartDate}): JSX.Element => (
  <MuiCheckbox
    id={`${type}DateSelectAllCheckbox`}
    inputRef={el => el && el.setAttribute('data-select-all', 'true')}
    onChange={event => {
      const checked = event.target.checked;
      document
        .querySelectorAll(`input[data-${type}-date-checkbox]`)
        .forEach(checkbox => {
          const inputElement = checkbox as HTMLInputElement;
          const muiInput = inputElement
            .closest('.MuiCheckbox-root')
            ?.querySelector(
              'input[type="checkbox"]'
            ) as HTMLInputElement | null;

          if (muiInput && muiInput.checked !== checked) {
            muiInput.click();
          }
        });
    }}
  />
);

const Checkbox = ({
  type,
  id,
}: {
  type: CoursePartDate;
  id: string;
}): JSX.Element => (
  <MuiCheckbox
    id={id}
    inputRef={el => el && el.setAttribute(`data-${type}-date-checkbox`, 'true')}
  />
);

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
  const [bulkDate, setBulkDate] = useState<Dayjs>(dayjs());
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

  const selectAllInputs = (select: string): HTMLInputElement[] => {
    return Array.from(document.querySelectorAll<HTMLInputElement>(select));
  };

  const handleClick = (type: CoursePartDate): void => {
    const checkedBoxes = Array.from(
      selectAllInputs(`input[data-${type}-date-checkbox]:checked`)
    ).map(checkbox => checkbox.id);

    if (checkedBoxes.length === 0) {
      enqueueSnackbar(t('course.results.upload.select-at-least-one-info'), {
        variant: 'info',
      });
    } else {
      setBulkEdit({type, courseTaskNames: checkedBoxes});
    }
  };

  const handleDateChange = (): void => {
    closeBulkEdit();
    if (bulkEdit === null) return;

    if (bulkEdit.type === 'completion') {
      bulkEdit.courseTaskNames.forEach(data =>
        handleCompletionDateChange(bulkDate, data)
      );
    } else {
      bulkEdit.courseTaskNames.forEach(data => {
        setDates(oldDates =>
          oldDates.map(oldDate =>
            oldDate.courseTaskName === data
              ? {
                  ...oldDate,
                  expirationDate: bulkDate,
                }
              : oldDate
          )
        );
      });
    }

    setBulkDate(dayjs());
  };

  const DateTable = (): JSX.Element => (
    <>
      <Dialog open={bulkEdit !== null} onClose={closeBulkEdit} maxWidth="sm">
        <DialogTitle>
          {t('course.results.upload.bulk-edit-dialog-title')}
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocalizedDatePicker
            value={bulkDate}
            onChange={value => {
              if (value === null) return;
              setBulkDate(value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={closeBulkEdit}
              sx={{mr: 'auto'}}
            >
              {t('general.cancel')}
            </Button>
            <Button onClick={handleDateChange} variant="contained">
              {t('general.done')}
            </Button>
          </DialogActions>
        </DialogActions>
      </Dialog>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('general.course-part')}</TableCell>
              <TableCell>
                <CheckAllCheckbox type="completion" />
                {t('course.results.upload.completion-date')}
                <Button
                  sx={{ml: 2}}
                  size="small"
                  variant="outlined"
                  onClick={() => handleClick('completion')}
                >
                  {t('course.results.upload.modify-selected')}
                </Button>
              </TableCell>
              <TableCell>
                <CheckAllCheckbox type="expiration" />
                {t('course.results.upload.expiration-date')}
                <Button
                  sx={{ml: 2}}
                  size="small"
                  variant="outlined"
                  onClick={() => handleClick('expiration')}
                >
                  {t('course.results.upload.modify-selected')}
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dates
              .filter(date => nonEmptyCols.includes(date.courseTaskName))
              .map(date => (
                <TableRow key={date.courseTaskName}>
                  <TableCell>{date.courseTaskName}</TableCell>
                  <TableCell>
                    <Checkbox id={date.courseTaskName} type="completion" />
                    <LocalizedDatePicker
                      slotProps={{textField: {size: 'small'}}}
                      value={date.completionDate}
                      onChange={value =>
                        handleCompletionDateChange(value, date.courseTaskName)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox id={date.courseTaskName} type="expiration" />
                    <LocalizedDatePicker
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
            {t('course.results.upload.dates')}
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
            {t('course.results.upload.confirm-data')}
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '70vh'}}>
              <StyledDataGrid
                rows={rows}
                columns={columns}
                rowHeight={25}
                rowSelection={false}
                disableColumnSelector
                getRowClassName={getRowClassName}
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogConfirm;
