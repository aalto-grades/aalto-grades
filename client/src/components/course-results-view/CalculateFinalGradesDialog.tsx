// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {StudentRow} from '@common/types';
import {
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
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useGetAllAssessmentModels} from '../../hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  selectedRows: StudentRow[];
  calculateFinalGrades: (
    modelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ) => Promise<boolean>;
};

const CalculateFinalGradesDialog = ({
  open,
  onClose,
  selectedRows,
  calculateFinalGrades,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const assessmentModels = useGetAllAssessmentModels(courseId);

  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] = useState<string>('');
  const modelList = useMemo(
    () => assessmentModels.data ?? [],
    [assessmentModels.data]
  );

  useEffect(() => {
    if (!open) return;

    let latestDate = new Date(1970, 0, 1);
    for (const row of selectedRows) {
      for (const att of row.attainments) {
        for (const grade of att.grades) {
          const gradeDate = new Date(grade.date!);
          if (gradeDate.getTime() > latestDate.getTime())
            latestDate = gradeDate;
        }
      }
    }
    setGradingDate(dayjs(latestDate));
  }, [open, selectedRows]);

  useEffect(() => {
    if (selectedModel === '' && modelList.length > 0)
      setSelectedModel(modelList[0].name);
  }, [modelList, selectedModel]);

  const handleSubmit = async (): Promise<void> => {
    const modelId = modelList.find(model => model.name === selectedModel)?.id;
    if (modelId === undefined) return;
    const success = await calculateFinalGrades(
      modelId,
      dateOverride,
      gradingDate.toDate()
    );
    if (success) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Calculate final grades</DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {selectedRows.length === 1
            ? 'Calculating final grade for 1 student'
            : `Calculating final grades for ${selectedRows.length} students`}
        </Typography>
        <FormControl sx={{display: 'block', mb: 2}}>
          <InputLabel id="calculateGradesSelect">Assessment model</InputLabel>
          <Select
            sx={{width: '100%'}}
            labelId="calculateGradesSelect"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            label="Assessment model"
          >
            {modelList.map(model => (
              <MenuItem
                key={`calculateGradesSelectModel-${model.id}`}
                value={model.name}
              >
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={dateOverride}
              onChange={e => setDateOverride(e.target.checked)}
            />
          }
          label="Override grading date for all students"
        />
        <Collapse in={dateOverride}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Grading date"
              sx={{width: '100%', mt: 2}}
              format="DD.MM.YYYY"
              value={gradingDate}
              onChange={newDate => newDate !== null && setGradingDate(newDate)}
            />
          </LocalizationProvider>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculateFinalGradesDialog;
