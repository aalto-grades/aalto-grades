// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {JSX} from 'react';

import {AplusGradeSourceData, AplusGradeSourceType} from '@/common/types';

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
  const getSourceName = (source: AplusGradeSourceData): string => {
    switch (source.sourceType) {
      case AplusGradeSourceType.FullPoints:
        return 'Full Points';
      case AplusGradeSourceType.Module:
        return source.moduleName;
      case AplusGradeSourceType.Difficulty:
        return source.difficulty;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ grade sources</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Code</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>Course Instance</TableCell>
                <TableCell>Course URL</TableCell>
                <TableCell>Source Name</TableCell>
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
