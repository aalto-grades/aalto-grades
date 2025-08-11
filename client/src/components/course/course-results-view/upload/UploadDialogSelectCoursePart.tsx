// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {CheckCircle, Inventory} from '@mui/icons-material';
import {
  Chip,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  styled,
} from '@mui/material';
import {Fragment, type JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {CoursePartData} from '@/common/types';
import {useGetCourseParts} from '@/hooks/useApi';

const StyledListItemButton = styled(ListItemButton)(({theme}) => ({
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

type PropsType = {
  setCoursePart: (coursePart: CoursePartData) => void;
};

const UploadDialogSelectCoursePart = ({
  setCoursePart,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams();
  const courseParts = useGetCourseParts(courseId!);

  return (
    <>
      <DialogTitle>{t('course.results.upload.select-course-part')}</DialogTitle>
      <DialogContent>
        {courseParts.data === undefined || courseParts.data.length === 0
          ? (
              <Typography>{t('course.parts.not-found')}</Typography>
            )
          : (
              <List component={Paper}>
                {courseParts.data.map(part => (
                  <Fragment key={part.id}>
                    <StyledListItemButton onClick={() => setCoursePart(part)}>
                      <ListItemText
                        primary={part.name}
                        secondary={
                          part.expiryDate?.toLocaleDateString()
                          ?? t('course.parts.no-expiry-date')
                        }
                      />
                      <Chip
                        label={
                          part.archived
                            ? t('general.archived')
                            : t('general.active')
                        }
                        sx={{minWidth: 100, ml: 2}}
                        icon={part.archived ? <Inventory /> : <CheckCircle />}
                        color={part.archived ? undefined : 'success'}
                      />
                    </StyledListItemButton>
                  </Fragment>
                ))}
              </List>
            )}
      </DialogContent>
    </>
  );
};

export default UploadDialogSelectCoursePart;
