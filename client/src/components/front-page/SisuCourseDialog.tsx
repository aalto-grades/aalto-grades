// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {SisuCourseInstance} from '@/common/types';
import SisuInstance from './SisuInstance';

type PropsType = {
  open: boolean;
  onClose: () => void;
  selectCourse: (instance: SisuCourseInstance) => void;
  courses: SisuCourseInstance[];
};

const SisuCourseDialog = ({
  open,
  onClose,
  selectCourse,
  courses,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        {t('course.edit.sisu-search-title')}: <b>{courses[0].code}</b>
      </DialogTitle>
      <DialogContent>
        <Divider />
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, my: 2}}>
          {courses.map(course => (
            <SisuInstance
              key={course.id}
              course={course}
              selectCourse={() => selectCourse(course)}
            />
          ))}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button variant="outlined" color="error" onClick={onClose}>
          {t('general.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SisuCourseDialog;
