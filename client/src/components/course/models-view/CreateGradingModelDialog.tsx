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
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {CoursePartData} from '@/common/types';
import {type GraphTemplate, initGraph} from '@/common/util';
import {
  useAddGradingModel,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';

const CreateGradingModelDialog = ({
  open,
  onClose,
  coursePart,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  coursePart?: CoursePartData;
  onSubmit: (id: number) => void;
}): JSX.Element => {
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

  const [oldOpen, setOldOpen] = useState<boolean>(false);
  if (open !== oldOpen) {
    setOldOpen(open);
    if (coursePart !== undefined) setName(coursePart.name);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
            <MenuItem value="addition">{t('shared.graph.node.add')}</MenuItem>
            <MenuItem value="average">
              {t('shared.graph.node.average')}
            </MenuItem>
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          type="submit"
          disabled={name.length === 0 || addGradingModel.isPending}
        >
          {t('general.submit')}
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
