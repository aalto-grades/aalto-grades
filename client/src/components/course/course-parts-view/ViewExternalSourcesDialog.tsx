// SPDX-FileCopyrightText: 2026 The Ossi Developers
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

import {type ExternalSourceData, SystemRole} from '@/common/types';
import {useDeleteExtServiceGradeSource} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';

type PropsType = {
  open: boolean;
  onClose: () => void;
  externalSources: ExternalSourceData[];
};

const ViewExternalSourcesDialog = ({
  open,
  onClose,
  externalSources,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId} = useParams() as {courseId: string};

  const deleteAplusSource = useDeleteExtServiceGradeSource(
    {
      id: 'aplus',
    },
    courseId,
  );
  const deleteMycoursesSource = useDeleteExtServiceGradeSource(
    {
      id: 'mycourses',
    },
    courseId,
  );

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge],
  );

  const handleDelete = (source: ExternalSourceData): void => {
    const serviceName = source.externalServiceName.toLowerCase();

    if (serviceName === 'aplus') {
      deleteAplusSource.mutate(source.id);
      onClose();
      return;
    }

    if (serviceName === 'mycourses') {
      deleteMycoursesSource.mutate(source.id);
      onClose();
      return;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('course.parts.external-source.list-title')}</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('general.source-name')}</TableCell>
                <TableCell>{t('general.course-code')}</TableCell>
                <TableCell>{t('general.course-name')}</TableCell>
                <TableCell>{t('general.instance')}</TableCell>
                <TableCell>{t('general.course-url')}</TableCell>
                <TableCell>Source info</TableCell>
                {editRights && <TableCell>{t('general.manage')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {externalSources.map(source => (
                <TableRow key={source.id}>
                  <TableCell>{source.externalServiceName}</TableCell>
                  <TableCell>{source.externalCourse.courseCode}</TableCell>
                  <TableCell>{source.externalCourse.name}</TableCell>
                  <TableCell>{source.externalCourse.instance}</TableCell>
                  <TableCell>
                    {source.externalCourse.url
                      ? (
                          <Link href={source.externalCourse.url} target="_blank">
                            {source.externalCourse.url}
                          </Link>
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <pre style={{margin: 0, whiteSpace: 'pre-wrap'}}>
                      {JSON.stringify(source.sourceInfo, null, 2)}
                    </pre>
                  </TableCell>
                  {editRights && (
                    <TableCell>
                      <Tooltip placement="top" title={t('general.delete')}>
                        <span>
                          <IconButton
                            onClick={() => handleDelete(source)}
                            disabled={
                              source.externalServiceName.toLowerCase() !== 'aplus'
                              && source.externalServiceName.toLowerCase() !== 'mycourses'
                            }
                          >
                            <Delete />
                          </IconButton>
                        </span>
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
        <Button onClick={onClose}>{t('general.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewExternalSourcesDialog;
