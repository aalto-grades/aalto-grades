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
import {useParams} from 'react-router-dom';

import {AplusGradeSourceData, AplusGradeSourceType} from '@/common/types';
import {useDeleteAplusGradeSource} from '../../hooks/useApi';

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
  const {courseId} = useParams() as {courseId: string};
  const deleteAplusGradeSource = useDeleteAplusGradeSource(courseId);

  const getSourceName = (source: AplusGradeSourceData): string => {
    switch (source.sourceType) {
      case AplusGradeSourceType.FullPoints:
        return 'Full points';
      case AplusGradeSourceType.Module:
        return source.moduleName;
      case AplusGradeSourceType.Exercise:
        return source.exerciseName;
      case AplusGradeSourceType.Difficulty:
        return source.difficulty;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>A+ grade sources</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course code</TableCell>
                <TableCell>Course name</TableCell>
                <TableCell>Course instance</TableCell>
                <TableCell>Course URL</TableCell>
                <TableCell>Source name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aplusGradeSources.map(source => (
                <TableRow>
                  <TableCell>{source.aplusCourse.courseCode}</TableCell>
                  <TableCell>{source.aplusCourse.name}</TableCell>
                  <TableCell>{source.aplusCourse.instance}</TableCell>
                  <TableCell>
                    <Link href={source.aplusCourse.url} target="_blank">
                      {source.aplusCourse.url}
                    </Link>
                  </TableCell>
                  <TableCell>{getSourceName(source)}</TableCell>
                  <TableCell>
                    <Tooltip placement="top" title="Delete A+ grade source">
                      <IconButton>
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
