// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {enqueueSnackbar} from 'notistack';
import {JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {FinalGradeData, Language, StudentRow} from '@/common/types';
import {useDownloadSisuGradeCsv} from '@/hooks/useApi';
import {useLocalize} from '@/hooks/useLocalize';
import {sisuLanguageOptions} from '@/utils/utils';

type DownloadOption = 'all' | 'exported' | 'unexported';

const SisuDownloadDialog = ({
  open,
  handleClose,
  handleExited,
  selectedRows,
}: {
  open: boolean;
  handleClose: () => void;
  handleExited: () => void;
  selectedRows: StudentRow[];
}): JSX.Element => {
  const {t} = useTranslation();
  const localize = useLocalize();
  const {courseId} = useParams() as {courseId: string};

  const downloadSisuGradeCsv = useDownloadSisuGradeCsv({
    onSuccess: gradeCsv => {
      const blob = new Blob([gradeCsv], {type: 'text/csv'});

      const linkElement = document.createElement('a');
      linkElement.href = URL.createObjectURL(blob);
      linkElement.download = `grades_course_${courseId}.csv`;
      document.body.append(linkElement);
      linkElement.click();
      linkElement.remove();

      enqueueSnackbar(t('course.results.final-downloaded'), {
        variant: 'success',
      });
    },
  });

  // state variables handling the assessment date and completion language.
  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [assessmentDate, setAssessmentDate] = useState<Dayjs | null>(dayjs());
  const [completionLanguage, setCompletionLanguage] = useState<
    Language | undefined
  >(undefined);
  const [downloadOption, setDownloadOption] =
    useState<DownloadOption>('unexported');

  const selectedStudents = selectedRows.map(row => ({
    studentNumber: row.user.studentNumber!,
    grades: row.finalGrades ?? [],
  }));

  const userGradeAlreadyExported = (grades: FinalGradeData[]): boolean =>
    grades.some(finalGrade => finalGrade.sisuExportDate !== null);

  const exportedValuesInList = useMemo(() => {
    for (const row of selectedRows) {
      if (userGradeAlreadyExported(row.finalGrades ?? [])) {
        return true;
      }
    }
    return false;
  }, [selectedRows]);

  const handleDownloadSisuGradeCsv = async (): Promise<void> => {
    if (!courseId) return;

    enqueueSnackbar(t('course.results.fetching-sisu-csv'), {variant: 'info'});

    let studentNumbers: string[] = [];
    switch (downloadOption) {
      case 'exported':
        studentNumbers = selectedStudents
          .filter(student => userGradeAlreadyExported(student.grades))
          .map(student => student.studentNumber);
        break;
      case 'unexported':
        studentNumbers = selectedStudents
          .filter(student => !userGradeAlreadyExported(student.grades))
          .map(student => student.studentNumber);
        break;
      case 'all':
        studentNumbers = selectedStudents.map(student => student.studentNumber);
        break;
    }
    if (studentNumbers.length === 0) {
      enqueueSnackbar(t('course.results.download-at-least-one'), {
        variant: 'warning',
      });
      return;
    }

    await downloadSisuGradeCsv.mutateAsync({
      courseId,
      data: {
        completionLanguage,
        assessmentDate:
          dateOverride && assessmentDate !== null
            ? assessmentDate.toDate()
            : undefined,
        studentNumbers: studentNumbers as [string, ...string[]], // Non-empty array
      },
    });
    if (!exportedValuesInList) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      transitionDuration={{exit: 800}}
      TransitionProps={{onExited: handleExited}}
      fullWidth
    >
      <DialogTitle>
        {t('course.results.download-final-as-sisu-csv')}
      </DialogTitle>
      <DialogContent sx={{pb: 0}}>
        <DialogContentText sx={{mb: 3, color: 'black'}}>
          {t('course.results.grading-date-default')}
        </DialogContentText>
        <TextField
          id="select-grading-completion-language"
          select
          fullWidth
          margin="normal"
          label={t('course.results.completion-language')}
          value={completionLanguage ?? 'default'}
          onChange={e => {
            if (e.target.value === 'default') {
              setCompletionLanguage(undefined);
            } else {
              setCompletionLanguage(e.target.value as Language);
            }
          }}
        >
          <MenuItem value="default">
            {t('course.results.use-course-language')}
          </MenuItem>
          {sisuLanguageOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>
              {localize(option.language)}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={dateOverride}
              onChange={e => setDateOverride(e.target.checked)}
            />
          }
          label={t('course.results.override-date')}
        />
        <Collapse in={dateOverride}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              sx={{mt: 2}}
              label={t('course.results.assessment-date')}
              value={assessmentDate}
              onChange={newDate => newDate && setAssessmentDate(newDate)}
            />
          </LocalizationProvider>
        </Collapse>
        {exportedValuesInList && (
          <Box sx={{my: 2}}>
            <Typography variant="body2" sx={{color: 'red'}}>
              {t('course.results.included-before')}
            </Typography>
            <Typography variant="body2" sx={{mt: 1, color: 'red'}}>
              {t('course.results.will-not-close')}
            </Typography>
            <TextField
              id="export-option"
              select
              fullWidth
              defaultValue="all"
              value={downloadOption}
              onChange={e =>
                setDownloadOption(e.target.value as DownloadOption)
              }
            >
              <MenuItem value="all">
                {t('course.results.download-all-selected')}
              </MenuItem>
              <MenuItem value="unexported">
                {t('course.results.download-unexported')}
              </MenuItem>
              <MenuItem value="exported">
                {t('course.results.download-exported')}
              </MenuItem>
            </TextField>
          </Box>
        )}
        <Typography variant="h6" sx={{mt: 1}}>
          {t('course.results.selected-students')}
        </Typography>
        <Paper sx={{maxHeight: 200, overflow: 'auto', my: 1}}>
          <List dense>
            {selectedRows.map(row => (
              <ListItem key={row.user.studentNumber}>
                <ListItemText
                  primary={`${t('general.student-number')}: ${row.user.studentNumber}`}
                  secondary={
                    userGradeAlreadyExported(row.finalGrades ?? [])
                      ? t('course.results.exported-already')
                      : ''
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          {t('general.cancel')}
        </Button>
        <Button
          id="ag-confirm-file-upload-btn"
          variant="contained"
          onClick={handleDownloadSisuGradeCsv}
        >
          {t('general.download')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SisuDownloadDialog;