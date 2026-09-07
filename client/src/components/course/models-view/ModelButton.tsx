// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Archive, Delete, Edit, Unarchive, Warning} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {GradingModelData} from '@/common/types';

type PropsType = {
  model: GradingModelData;
  editRights: boolean;
  modelsWithFinalGrades: Set<number>;
  finalGradeCount?: number;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClick: () => void;
};

const ModelButton = ({
  model,
  editRights,
  modelsWithFinalGrades,
  finalGradeCount = 0,
  onEdit,
  onArchive,
  onDelete,
  onClick,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  let warning = '';
  const numErrors =
    Number(model.hasExpiredSources)
    + Number(model.hasArchivedSources)
    + Number(model.hasDeletedSources);

  if (numErrors > 1) warning = t('course.models.has-multiple-warnings');
  else if (model.hasExpiredSources) warning = t('course.models.has-expired');
  else if (model.hasArchivedSources) warning = t('course.models.has-archived');
  else if (model.hasDeletedSources) warning = t('course.models.has-deleted');

  return (
    <ListItem
      sx={{backgroundColor: model.archived ? 'primary.light' : ''}}
      disablePadding
      secondaryAction={(
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {finalGradeCount > 0 && (
            <Tooltip
              placement="top"
              title={t('course.models.final-grade-count', {
                count: finalGradeCount,
              })}
            >
              <Chip
                size="small"
                label={finalGradeCount}
                sx={{mr: 1}}
              />
            </Tooltip>
          )}
          {numErrors > 0 && (
            <Tooltip title={warning} placement="top">
              <Warning color="warning" />
            </Tooltip>
          )}
          {editRights && (
            <>
              <Tooltip placement="top" title={t('course.models.rename.title')}>
                <IconButton onClick={onEdit}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip
                placement="top"
                title={
                  model.archived
                    ? t('course.models.unarchive')
                    : t('course.models.archive')
                }
              >
                <IconButton onClick={onArchive}>
                  {model.archived ? <Unarchive /> : <Archive />}
                </IconButton>
              </Tooltip>
              <Tooltip
                placement="top"
                title={
                  modelsWithFinalGrades.has(model.id)
                    ? t('course.models.cannot-delete-with-final')
                    : t('course.models.delete-grading-model')
                }
              >
                <span>
                  <IconButton
                    disabled={modelsWithFinalGrades.has(model.id)}
                    edge="end"
                    onClick={onDelete}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </Box>
      )}
    >
      <ListItemButton onClick={onClick}>
        <ListItemText primary={model.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default ModelButton;
