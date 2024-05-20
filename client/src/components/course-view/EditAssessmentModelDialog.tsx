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
  TextField,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useEditAssessmentModel} from '../../hooks/useApi';

type EditAssessmentModelDialogProps = {
  assessmentModelId: number | null;
  name: string | null;
  onClose: () => void;
  open: boolean;
};
const EditAssessmentModelDialog = ({
  assessmentModelId,
  name,
  onClose,
  open,
}: EditAssessmentModelDialogProps): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const editAssessmentModel = useEditAssessmentModel();

  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    if (name !== null && name !== newName) setNewName(name);
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (): Promise<void> => {
    if (assessmentModelId === null) return;
    await editAssessmentModel.mutateAsync({
      courseId,
      assessmentModelId,
      assessmentModel: {name: newName},
    });

    enqueueSnackbar('Assessment model saved', {variant: 'success'});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit Assessment Model</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          required
          fullWidth
          value={newName}
          disabled={editAssessmentModel.isPending}
          onChange={e => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={editAssessmentModel.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          type="submit"
          disabled={newName.length === 0 || editAssessmentModel.isPending}
        >
          Save
          {editAssessmentModel.isPending && (
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

export default EditAssessmentModelDialog;
