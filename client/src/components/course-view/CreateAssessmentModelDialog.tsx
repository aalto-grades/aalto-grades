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
import {useAddAssessmentModel, useGetAttainments} from '../../hooks/useApi';

const CreateAssessmentModelDialog = ({
  handleClose,
  open,
  onSubmit,
}: {
  handleClose: () => void;
  open: boolean;
  onSubmit: (id: number) => void;
}): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const attainments = useGetAttainments(courseId);
  const addAssessmentModel = useAddAssessmentModel();

  const [name, setName] = useState<string>('');
  const [template, setTemplate] = useState<GraphTemplate>('none');

  const handleSubmit = (): void => {
    if (attainments.data === undefined) return;
    addAssessmentModel.mutate(
      {
        courseId: courseId,
        assessmentModel: {
          name,
          graphStructure: initGraph(template, attainments.data),
        },
      },
      {
        onSuccess: id => {
          handleClose();
          onSubmit(id);
          setName('');
          setTemplate('none');
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Assessment Model</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          required
          fullWidth
          value={name}
          disabled={addAssessmentModel.isPending}
          onChange={e => setName(e.target.value)}
        />
        <FormControl
          fullWidth
          sx={{mt: 2}}
          disabled={addAssessmentModel.isPending}
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
          onClick={handleClose}
          disabled={addAssessmentModel.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          type="submit"
          disabled={name.length === 0 || addAssessmentModel.isPending}
        >
          Submit
          {addAssessmentModel.isPending && (
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

export default CreateAssessmentModelDialog;
