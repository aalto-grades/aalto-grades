import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useGetAllAssessmentModels} from '../../hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  numSelected: number;
  calculateFinalGrades: (
    modelId: number,
    gradingDate: Date
  ) => Promise<boolean>;
};

const CalculateFinalGradesDialog = ({
  open,
  onClose,
  numSelected,
  calculateFinalGrades,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const assesmentModels = useGetAllAssessmentModels(courseId);

  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] = useState<string>('');
  const modelList = useMemo(
    () => assesmentModels.data ?? [],
    [assesmentModels.data]
  );

  useEffect(() => {
    if (selectedModel === '' && modelList.length > 0)
      setSelectedModel(modelList[0].name);
  }, [modelList, selectedModel]);

  const handleSubmit = async (): Promise<void> => {
    const modelId = modelList.find(model => model.name === selectedModel)?.id;
    if (modelId === undefined) return;
    const success = await calculateFinalGrades(modelId, gradingDate.toDate());
    if (success) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Calculate final grades</DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {numSelected === 1
            ? 'Calculating final grade for 1 student'
            : `Calculating final grades for ${numSelected} students`}
        </Typography>
        <FormControl sx={{display: 'block', mb: 2}}>
          <InputLabel id="calculateGradesSelect">Assesment model</InputLabel>
          <Select
            sx={{width: '100%'}}
            labelId="calculateGradesSelect"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            label="Assesment model"
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Grading date"
            sx={{width: '100%'}}
            format="DD.MM.YYYY"
            value={gradingDate}
            onChange={newDate => newDate !== null && setGradingDate(newDate)}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculateFinalGradesDialog;
