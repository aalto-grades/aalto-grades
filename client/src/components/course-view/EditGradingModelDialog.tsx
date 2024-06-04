// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useEditGradingModel} from '../../hooks/useApi';

type PropsType = {
  gradingModelId: number | null;
  name: string | null;
  onClose: () => void;
  open: boolean;
};
const EditGradingModelDialog = ({
  gradingModelId,
  name,
  onClose,
  open,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const editGradingModel = useEditGradingModel();

  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    if (name !== null && name !== newName) setNewName(name);
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (): Promise<void> => {
    if (gradingModelId === null) return;
    await editGradingModel.mutateAsync({
      courseId,
      gradingModelId: gradingModelId,
      gradingModel: {name: newName},
    });

    enqueueSnackbar('Grading model saved', {variant: 'success'});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit Grading Model</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          required
          fullWidth
          value={newName}
          disabled={editGradingModel.isPending}
          onChange={e => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={editGradingModel.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          type="submit"
          disabled={newName.length === 0 || editGradingModel.isPending}
        >
          Save
          {editGradingModel.isPending && (
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

export default EditGradingModelDialog;
