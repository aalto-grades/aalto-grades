// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import type {GridColDef, GridValidRowModel} from '@mui/x-data-grid';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {StudentData} from '@/common/types';
import StyledDataGrid from '@/components/shared/StyledDataGrid';
import {useGetGradesHistory} from '@/hooks/api/history';

type ColTypes = {
  name: string;
  actionType: string;
  date: string;
};

type PropsType = {
  open: boolean;
  onClose: () => void;
  studentUser?: StudentData;
  courseTaskId?: number;
};
const GradesHistoryDialog = ({
  open,
  onClose,
  studentUser,
  courseTaskId,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const gradesHistory = useGetGradesHistory(courseTaskId);
  const gradesHistoryFiltered = gradesHistory.data?.filter(
    entry =>
      entry.previousState?.userId === studentUser?.id ||
      entry.taskGrade?.user.id === studentUser?.id
  );

  const rows =
    gradesHistoryFiltered?.map((entry, i) => ({
      id: i,
      gradeId: entry.taskGrade?.id ?? entry.previousState?.id ?? 'Error',
      name: entry.courseTaskId,
      actionType: entry.actionType,
      date: entry.updatedAt,
      user: entry.user?.name,
    })) ?? [];

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'actionType',
      headerName: t('general.results.history.action-type'),
      type: 'string',
    },
    {
      field: 'date',
      headerName: t('general.results.history.action-date'),
      type: 'dateTime',
    },
    {
      field: 'user',
      headerName: t('general.results.history.author'),
      type: 'string',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>{t('general.results.history.title')}</DialogTitle>
      {gradesHistory.data !== undefined && (
        <DialogContent>
          <div style={{height: '30vh'}}>
            <StyledDataGrid
              rows={rows}
              columns={columns as GridColDef<GridValidRowModel>[]}
              rowHeight={25}
              rowSelection={false}
              autosizeOnMount
              disableColumnSelector
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default GradesHistoryDialog;
