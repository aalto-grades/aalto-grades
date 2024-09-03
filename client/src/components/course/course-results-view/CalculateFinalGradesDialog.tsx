// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {type Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {GradingModelData, StudentRow} from '@/common/types';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useGetAllGradingModels} from '@/hooks/useApi';
import {type GradeSelectOption, getErrorTypes} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  selectedRows: GroupedStudentRow[];
  gradeSelectOption: GradeSelectOption;
  calculateFinalGrades: (
    selectedRows: StudentRow[],
    modelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ) => Promise<boolean>;
};

const CalculateFinalGradesDialog = ({
  open,
  onClose,
  selectedRows,
  gradeSelectOption,
  calculateFinalGrades,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const allGradingModels = useGetAllGradingModels(courseId);
  // TODO: Auto select the model used in the table view

  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] = useState<GradingModelData | null>(
    null
  );

  // Filter out archived models
  const modelList = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.filter(model => !model.archived)
        : [],
    [allGradingModels.data]
  );

  const errors = useMemo(
    () => getErrorTypes(selectedRows, selectedModel?.id ?? 'any'),
    [selectedRows, selectedModel]
  );

  useEffect(() => {
    if (!open) return;

    let latestDate = new Date(1970, 0, 1);
    for (const row of selectedRows) {
      for (const courseTask of row.courseTasks) {
        for (const grade of courseTask.grades) {
          if (grade.date && grade.date.getTime() > latestDate.getTime())
            latestDate = grade.date;
        }
      }
    }
    setGradingDate(dayjs(latestDate));
  }, [open, selectedRows]);

  useEffect(() => {
    if (selectedModel === null && modelList.length > 0)
      setSelectedModel(modelList[0]);
  }, [modelList, selectedModel]);

  const handleSubmit = async (): Promise<void> => {
    if (selectedModel === null) return;
    const success = await calculateFinalGrades(
      selectedRows,
      selectedModel.id,
      dateOverride,
      gradingDate.toDate()
    );
    if (success) onClose();
  };

  const getWarning = (model: GradingModelData | null): string => {
    if (model === null) return '';
    if (model.hasArchivedSources && model.hasDeletedSources)
      return t('course.results.model-has-deleted-and-archived');
    if (model.hasArchivedSources) return t('course.results.model-has-archived');
    if (model.hasDeletedSources) return t('course.results.model-has-deleted');
    return '';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('course.results.calculate-final')}</DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {t('course.results.calculating-for', {count: selectedRows.length})}
        </Typography>

        {/* Warnings */}
        {gradeSelectOption === 'latest' && (
          <Alert sx={{mb: 2, mt: -1}} severity="info">
            {t('course.results.using-latest')}
          </Alert>
        )}
        <Collapse in={errors.InvalidGrade}>
          <Alert sx={{mb: 2, mt: -1}} severity="warning">
            {t('course.results.some-grade-invalid')}
          </Alert>
        </Collapse>
        <Collapse
          in={
            selectedModel?.hasDeletedSources ||
            selectedModel?.hasArchivedSources
          }
        >
          <Alert sx={{mb: 2, mt: -1}} severity="warning">
            {getWarning(selectedModel)}
          </Alert>
        </Collapse>
        <Collapse
          in={errors.InvalidPredictedGrade || errors.OutOfRangePredictedGrade}
        >
          <Alert sx={{mb: 2, mt: -1}} severity="error">
            {t('course.results.some-final-invalid')}
          </Alert>
        </Collapse>

        <FormControl sx={{display: 'block'}}>
          <InputLabel id="calculate-grades-select">
            {t('general.grading-model')}
          </InputLabel>
          <Select
            labelId="calculate-grades-select"
            sx={{width: '100%'}}
            value={selectedModel?.name ?? ''}
            onChange={e => {
              setSelectedModel(
                modelList.find(model => model.name === e.target.value)!
              );
            }}
            label={t('general.grading-model')}
          >
            {modelList.map(model => (
              <MenuItem key={model.id} value={model.name}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          sx={{mt: 1}}
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
              label={t('general.grading-date')}
              sx={{width: '100%', mt: 2}}
              format="DD.MM.YYYY"
              value={gradingDate}
              onChange={newDate => newDate !== null && setGradingDate(newDate)}
            />
          </LocalizationProvider>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            errors.InvalidPredictedGrade || errors.OutOfRangePredictedGrade
          }
        >
          {t('general.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculateFinalGradesDialog;
