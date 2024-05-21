// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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
import {DataGrid, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {GradeUploadColTypes} from './UploadDialog';

type DateType = {
  attainmentName: string;
  completionDate: Dayjs;
  expirationDate: Dayjs;
};
type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp<GradeUploadColTypes>;
  setReady: Dispatch<SetStateAction<boolean>>;
  dates: DateType[];
  setDates: Dispatch<SetStateAction<DateType[]>>;
  expanded: '' | 'date' | 'confirm';
  setExpanded: Dispatch<SetStateAction<'' | 'date' | 'confirm'>>;
};

const UploadDialogConfirm = ({
  columns,
  rows,
  setReady,
  dates,
  setDates,
  expanded,
  setExpanded,
}: PropsType): JSX.Element => {
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

  useEffect(() => {
    let newError = false;
    for (const date of dates) {
      if (date.expirationDate <= date.completionDate) newError = true;
    }
    if (newError !== error) {
      setError(newError);
      if (newError) setReady(false);
      else setReady(true);
    }
  }, [dates, error, setReady]);

  const handleCompletionDateChange = (
    newCompletionDate: Dayjs | null,
    attainmentName: string
  ): void => {
    if (newCompletionDate === null) return;

    // Move expiration date the same amount as the new date
    setDates(oldDates =>
      oldDates.map(oldDate =>
        oldDate.attainmentName === attainmentName
          ? {
              ...oldDate,
              completionDate: newCompletionDate,
              expirationDate: oldDate.expirationDate.add(
                newCompletionDate.diff(oldDate.completionDate)
              ),
            }
          : oldDate
      )
    );
  };

  return (
    <>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>
        <Accordion
          expanded={expanded === 'date'}
          onChange={(_, newExpanded) => setExpanded(newExpanded ? 'date' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Completion And Expiration Dates
          </AccordionSummary>
          <AccordionDetails>
            {dates.length > nonEmptyCols.length && (
              <Alert severity="info" sx={{mb: 1}}>
                Some attainments are hidden due to not having any data
              </Alert>
            )}
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="en-gb"
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Attainment</TableCell>
                      <TableCell>Completion date</TableCell>
                      <TableCell>Expiration date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dates
                      .filter(date =>
                        nonEmptyCols.includes(date.attainmentName)
                      )
                      .map(date => (
                        <TableRow key={`dateRow-${date.attainmentName}`}>
                          <TableCell>{date.attainmentName}</TableCell>
                          <TableCell>
                            <DatePicker
                              slotProps={{textField: {size: 'small'}}}
                              value={date.completionDate}
                              onChange={value =>
                                handleCompletionDateChange(
                                  value,
                                  date.attainmentName
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error:
                                    date.expirationDate <= date.completionDate,
                                  helperText:
                                    date.expirationDate <= date.completionDate
                                      ? 'Expiry date must be after completion date'
                                      : '',
                                },
                              }}
                              value={date.expirationDate}
                              onChange={e =>
                                setDates(oldDates =>
                                  oldDates.map(oldDate =>
                                    oldDate.attainmentName ===
                                      date.attainmentName && e !== null
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
            Confirm Data
          </AccordionSummary>
          <AccordionDetails>
            <div style={{height: '70vh'}}>
              <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={25}
                rowSelection={false}
                disableColumnSelector
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogConfirm;
