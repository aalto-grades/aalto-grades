// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en-gb';

import {ExpandMore} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  DialogContent,
  DialogTitle,
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
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
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

import StyledDataGrid from '@/components/shared/StyledDataGrid';
import type {GradeUploadColTypes} from './UploadDialog';

export type DateType = {
  courseTaskName: string;
  completionDate: Dayjs;
  expirationDate: Dayjs | null;
};

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

  const DateTable = (): JSX.Element => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('general.course-part')}</TableCell>
            <TableCell>{t('course.results.upload.completion-date')}</TableCell>
            <TableCell>{t('course.results.upload.expiration-date')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dates
            .filter(date => nonEmptyCols.includes(date.courseTaskName))
            .map(date => (
              <TableRow key={date.courseTaskName}>
                <TableCell>{date.courseTaskName}</TableCell>
                <TableCell>
                  <DatePicker
                    slotProps={{textField: {size: 'small'}}}
                    value={date.completionDate}
                    onChange={value =>
                      handleCompletionDateChange(value, date.courseTaskName)
                    }
                  />
                </TableCell>
                <TableCell>
                  <DatePicker
                    disabled={date.expirationDate === null}
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
  );

  return (
    <>
      <DialogTitle>Confirm</DialogTitle>
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
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="en-gb"
            >
              <DateTable />
            </LocalizationProvider>
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
