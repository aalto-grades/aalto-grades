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
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';

type PropsType = {
  columns: GridColDef[];
  rows: GridRowsProp;
  setReady: Dispatch<SetStateAction<boolean>>;
  dates: {
    attainmentName: string;
    completionDate: Dayjs;
    expirationDate: Dayjs;
  }[];
  setDates: Dispatch<
    SetStateAction<
      {
        attainmentName: string;
        completionDate: Dayjs;
        expirationDate: Dayjs;
      }[]
    >
  >;
};

const UploadDialogConfirm = ({
  columns,
  rows,
  setReady,
  dates,
  setDates,
}: PropsType) => {
  const [expanded, setExpanded] = useState<'' | 'date' | 'confirm'>('date');

  useEffect(() => {
    setReady(expanded === 'confirm');
  }, [expanded, setReady]);

  const nonEmptyCols = useMemo(() => {
    const newNonEmptyCols: string[] = [];
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (
          key === 'id' ||
          key === 'StudentNo' ||
          value === '' ||
          value === null
        )
          continue;
        if (!newNonEmptyCols.includes(key)) newNonEmptyCols.push(key);
      }
    }
    return newNonEmptyCols;
  }, [rows]);

  return (
    <>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>
        <Accordion
          expanded={expanded === 'date'}
          onChange={(_, expanded) => setExpanded(expanded ? 'date' : '')}
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                              format="DD.MM.YYYY"
                              onChange={e =>
                                setDates(oldDates =>
                                  oldDates.map(oldDate =>
                                    oldDate.attainmentName ===
                                      date.attainmentName && e !== null
                                      ? {...oldDate, completionDate: e}
                                      : oldDate
                                  )
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              slotProps={{textField: {size: 'small'}}}
                              value={date.expirationDate}
                              format="DD.MM.YYYY"
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
          onChange={(_, expanded) => setExpanded(expanded ? 'confirm' : '')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Confirm Data
          </AccordionSummary>
          <AccordionDetails>
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={25}
              rowSelection={false}
              disableColumnSelector
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </>
  );
};

export default UploadDialogConfirm;
