// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

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
  TextField,
} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {CoursePartData} from '@/common/types';
import {type GraphTemplate, initGraph} from '@/common/util';
import LoadingButton from '@/components/shared/LoadingButton';
import {
  useAddGradingModel,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: number) => void;
  coursePart?: CoursePartData;
};
const CreateGradingModelDialog = ({
  open,
  onClose,
  onSubmit,
  coursePart,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addGradingModel = useAddGradingModel();

  const [name, setName] = useState<string>('');
  const [template, setTemplate] = useState<GraphTemplate>('none');

  const handleSubmit = (): void => {
    if (courseParts.data === undefined || courseTasks.data === undefined)
      return;
    addGradingModel.mutate(
      {
        courseId: courseId,
        gradingModel: {
          coursePartId: coursePart?.id ?? null,
          name,
          graphStructure: initGraph(
            template,
            coursePart !== undefined
              ? courseTasks.data.filter(
                  task => task.coursePartId === coursePart.id && !task.archived
                )
              : courseParts.data.filter(part => !part.archived),
            coursePart ?? null
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

  // Check if name should be updated when reopened
  const [oldOpen, setOldOpen] = useState<boolean>(false);
  if (open !== oldOpen) {
    setOldOpen(open);
    if (coursePart !== undefined) setName(coursePart.name);
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        if (coursePart) setName('');
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {coursePart !== undefined
          ? t('course.models.create-model.part-title', {part: coursePart.name})
          : t('course.models.create-model.final-grade-title')}
      </DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label={t('general.name')}
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
          <InputLabel id="select-model-template">
            {t('course.models.create-model.select-template')}
          </InputLabel>
          <Select
            labelId="select-model-template"
            value={template}
            label={t('course.models.create-model.select-template')}
            onChange={e => setTemplate(e.target.value as GraphTemplate)}
          >
            <MenuItem value="none">
              {t('course.models.create-model.none')}
            </MenuItem>
            <MenuItem value="addition">
              {t('shared.graph.node.addition')}
            </MenuItem>
            <MenuItem value="average">
              {t('shared.graph.node.average')}
            </MenuItem>
            <MenuItem value="max">{t('shared.graph.node.max')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={addGradingModel.isPending}
        >
          {t('general.cancel')}
        </Button>
        <LoadingButton
          loading={addGradingModel.isPending}
          onClick={handleSubmit}
          variant="contained"
          type="submit"
          disabled={name.length === 0 || addGradingModel.isPending}
        >
          {t('general.submit')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGradingModelDialog;
