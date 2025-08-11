// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {AddBox} from '@mui/icons-material';
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {CoursePartData} from '@/common/types';

type PropsType = {
  part: CoursePartData;
  onClick: () => void;
};
const MissingModelButton = ({part, onClick}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  return (
    <ListItem
      disablePadding
      secondaryAction={(
        <Tooltip
          title={t('course.models.missing-part-model-create')}
          placement="top"
        >
          <IconButton onClick={onClick} edge="end">
            <AddBox />
          </IconButton>
        </Tooltip>
      )}
    >
      <ListItemButton onClick={onClick}>
        <ListItemText primary={part.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default MissingModelButton;
