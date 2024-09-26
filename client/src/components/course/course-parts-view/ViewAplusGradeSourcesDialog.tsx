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
import {type JSX, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {
  type AplusGradeSourceData,
  AplusGradeSourceType,
  SystemRole,
} from '@/common/types';
import {useDeleteAplusGradeSource} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';

type PropsType = {
  open: boolean;
  onClose: () => void;
  aplusGradeSources: AplusGradeSourceData[];
};
const ViewAplusGradeSourcesDialog = ({
  open,
  onClose,
  aplusGradeSources,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const deleteAplusGradeSource = useDeleteAplusGradeSource(courseId);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

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
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
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
                {editRights && <TableCell>{t('general.manage')}</TableCell>}
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
                  {editRights && (
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
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAplusGradeSourcesDialog;
