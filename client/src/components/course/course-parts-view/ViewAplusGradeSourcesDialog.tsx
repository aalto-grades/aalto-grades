// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {AplusGradeSourceData, AplusGradeSourceType} from '@/common/types';
import {useDeleteAplusGradeSource} from '@/hooks/useApi';

type PropsType = {
  handleClose: () => void;
  open: boolean;
  aplusGradeSources: AplusGradeSourceData[];
};

const ViewAplusGradeSourcesDialog = ({
  handleClose,
  open,
  aplusGradeSources,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const deleteAplusGradeSource = useDeleteAplusGradeSource(courseId);

  const getSourceName = (source: AplusGradeSourceData): string => {
    switch (source.sourceType) {
      case AplusGradeSourceType.FullPoints:
        return t('general.full-points');
      case AplusGradeSourceType.Module:
        return source.moduleName;
      case AplusGradeSourceType.Exercise:
        return source.exerciseName;
      case AplusGradeSourceType.Difficulty:
        return source.difficulty;
    }
  };

  const handleDelete = (aplusGradeSourceId: number): void => {
    deleteAplusGradeSource.mutate(aplusGradeSourceId);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>{t('general.a+-grade-sources')}</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('general.course-code')}</TableCell>
                <TableCell>{t('general.course-name')}</TableCell>
                <TableCell>{t('general.instance')}</TableCell>
                <TableCell>{t('general.course-url')}</TableCell>
                <TableCell>{t('general.source-name')}</TableCell>
                <TableCell>{t('general.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aplusGradeSources.map(source => (
                <TableRow key={source.id}>
                  <TableCell>{source.aplusCourse.courseCode}</TableCell>
                  <TableCell>{source.aplusCourse.name}</TableCell>
                  <TableCell>{source.aplusCourse.instance}</TableCell>
                  <TableCell>
                    <Link href={source.aplusCourse.url} target="_blank">
                      {source.aplusCourse.url}
                    </Link>
                  </TableCell>
                  <TableCell>{getSourceName(source)}</TableCell>
                  <TableCell>{source.date.toDateString()}</TableCell>
                  <TableCell>
                    <Tooltip
                      placement="top"
                      title={t('course.parts.delete-a+')}
                    >
                      <IconButton onClick={() => handleDelete(source.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAplusGradeSourcesDialog;
