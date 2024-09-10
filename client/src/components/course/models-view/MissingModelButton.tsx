// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ListItem, ListItemButton, ListItemText} from '@mui/material';
import {grey} from '@mui/material/colors';
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
      sx={{backgroundColor: grey[300]}}
      disablePadding
      title={t('course.models.missing-part-model-create')}
    >
      <ListItemButton onClick={onClick}>
        <ListItemText primary={part.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default MissingModelButton;
