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
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {useEditGradingModel} from '@/hooks/useApi';

type PropsType = {
  gradingModelId: number | null;
  name: string | null;
  onClose: () => void;
  open: boolean;
};
const RenameGradingModelDialog = ({
  gradingModelId,
  name,
  onClose,
  open,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const editGradingModel = useEditGradingModel();

  const [newName, setNewName] = useState<string>('');

  // Update newName state when name prop changes
  const [oldName, setOldName] = useState<typeof name>(null);
  if (name !== oldName) {
    setOldName(name);
    if (name !== null && name !== newName) setNewName(name);
  }

  const handleSave = async (): Promise<void> => {
    if (gradingModelId === null) return;
    await editGradingModel.mutateAsync({
      courseId,
      gradingModelId: gradingModelId,
      gradingModel: {name: newName},
    });

    enqueueSnackbar(t('course.models.rename.saved'), {variant: 'success'});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('course.models.rename.title')}</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label={t('general.name')}
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
          {t('general.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          type="submit"
          disabled={newName.length === 0 || editGradingModel.isPending}
        >
          {t('general.save')}
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

export default RenameGradingModelDialog;
