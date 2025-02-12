// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import {Fragment, type JSX} from 'react';
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
          {courseParts.data?.map((part, index) => (
            <Fragment key={part.id}>
              <ListItemButton onClick={() => setCoursePart(part)}>
                <ListItemText primary={part.name} />
              </ListItemButton>
              {courseParts.data.length - 1 !== index && <Divider />}
            </Fragment>
          ))}
        </List>
      </DialogContent>
    </>
  );
};

export default UploadDialogSelectCoursePart;
