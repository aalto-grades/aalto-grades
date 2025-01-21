// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {CoursePartData} from '@/common/types';
import {useGetCourseParts} from '@/hooks/useApi';

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
        <List component={Paper}>
          {courseParts.data?.map(part => (
            <ListItemButton key={part.id} onClick={() => setCoursePart(part)}>
              <ListItemText primary={part.name} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </>
  );
};

export default UploadDialogSelectCoursePart;
