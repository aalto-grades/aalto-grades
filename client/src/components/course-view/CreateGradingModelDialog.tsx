// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {GraphTemplate, initGraph} from '@/common/util/initGraph';
import {useAddGradingModel, useGetCourseParts} from '../../hooks/useApi';

const CreateGradingModelDialog = ({
  onClose,
  open,
  onSubmit,
}: {
  onClose: () => void;
  open: boolean;
  onSubmit: (id: number) => void;
}): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const addGradingModel = useAddGradingModel();

  const [name, setName] = useState<string>('');
  const [template, setTemplate] = useState<GraphTemplate>('none');

  const handleSubmit = (): void => {
    if (courseParts.data === undefined) return;
    addGradingModel.mutate(
      {
        courseId: courseId,
        gradingModel: {
          name,
          graphStructure: initGraph(
            template,
            courseParts.data.filter(coursePart => !coursePart.archived)
          ),
        },
      },
      {
        onSuccess: id => {
          onClose();
          onSubmit(id);
          setName('');
          setTemplate('none');
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Grading Model</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          required
          fullWidth
          value={name}
          disabled={addGradingModel.isPending}
          onChange={e => setName(e.target.value)}
        />
        <FormControl
          fullWidth
          sx={{mt: 2}}
          disabled={addGradingModel.isPending}
        >
          <InputLabel id="select-model-template">Select template</InputLabel>
          <Select
            labelId="select-model-template"
            value={template}
            label="Select template"
            onChange={e => setTemplate(e.target.value as GraphTemplate)}
          >
            <MenuItem value={'none'}>None</MenuItem>
            <MenuItem value={'addition'}>Addition</MenuItem>
            <MenuItem value={'average'}>Average</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={addGradingModel.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          type="submit"
          disabled={name.length === 0 || addGradingModel.isPending}
        >
          Submit
          {addGradingModel.isPending && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGradingModelDialog;