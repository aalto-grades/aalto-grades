// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import 'dayjs/locale/en-gb';

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
import dayjs, {type Dayjs} from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {FinalGradeData, Language, StudentRow} from '@/common/types';
import LocalizedDatePicker from '@/components/shared/LocalizedDatePicker';
import {useDownloadSisuGradeCsv, useGetCourse} from '@/hooks/useApi';
import {useLocalize} from '@/hooks/useLocalize';
import {sisuLanguageOptions} from '@/utils';

type DownloadOption = 'all' | 'exported' | 'unexported';

type PropsType = {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
  selectedRows: StudentRow[];
};
const SisuDownloadDialog = ({
  open,
  onClose,
  onExited,
  selectedRows,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const localize = useLocalize();
  const {courseId} = useParams() as {courseId: string};
  const course = useGetCourse(courseId);
  const courseToDisplay = course.data ? course.data.courseCode : courseId;

  // State variables handling the assessment date and completion language.
  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [assessmentDate, setAssessmentDate] = useState<Dayjs | null>(dayjs());
  const [completionLanguage, setCompletionLanguage] = useState<
    Language | undefined
  >(undefined);
  const [downloadOption, setDownloadOption] =
    useState<DownloadOption>('unexported');

  const downloadSisuGradeCsv = useDownloadSisuGradeCsv({
    onSuccess: gradeCsv => {
      const blob = new Blob([gradeCsv], {type: 'text/csv'});
      const date = new Date();
      const dateFormat = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;

      const linkElement = document.createElement('a');
      linkElement.href = URL.createObjectURL(blob);
      linkElement.download = `grades_course_${courseToDisplay}_${dateFormat}_${downloadOption}.csv`;
      document.body.append(linkElement);
      linkElement.click();
      linkElement.remove();

      enqueueSnackbar(t('course.results.final-downloaded'), {
        variant: 'success',
      });
    },
  });

  const selectedStudents = selectedRows.map(row => ({
    studentNumber: row.user.studentNumber,
    grades: row.finalGrades,
  }));

  const userGradeAlreadyExported = (grades: FinalGradeData[]): boolean =>
    grades.some(finalGrade => finalGrade.sisuExportDate !== null);

  const exportedValuesInList = useMemo(
    () => selectedRows.some(row => userGradeAlreadyExported(row.finalGrades)),
    [selectedRows]
  );

  const handleDownloadSisuGradeCsv = async (): Promise<void> => {
    if (!courseId) return;

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

    enqueueSnackbar(t('course.results.fetching-sisu-csv'), {variant: 'info'});
    await downloadSisuGradeCsv.mutateAsync({
      courseId,
      data: {
        completionLanguage: completionLanguage ?? null,
        assessmentDate:
          dateOverride && assessmentDate !== null
            ? assessmentDate.toDate()
            : null,
        studentNumbers: studentNumbers as [string, ...string[]], // Non-empty array
      },
    });
    if (!exportedValuesInList) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      transitionDuration={{exit: 800}}
      TransitionProps={{onExited: onExited}}
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
          <LocalizedDatePicker
            sx={{mt: 2}}
            label={t('course.results.assessment-date')}
            value={assessmentDate}
            onChange={newDate => newDate && setAssessmentDate(newDate)}
          />
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
                    userGradeAlreadyExported(row.finalGrades)
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
        <Button variant="outlined" onClick={onClose}>
          {exportedValuesInList ? t('general.close') : t('general.cancel')}
        </Button>
        <Button variant="contained" onClick={handleDownloadSisuGradeCsv}>
          {t('general.download')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SisuDownloadDialog;
