// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import type {GridColDef, GridValidRowModel} from '@mui/x-data-grid';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

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
  studentId?: string;
  courseTaskId?: number;
};
const GradesHistoryDialog = ({
  open,
  onClose,
  studentId,
  courseTaskId,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const gradesHistory = useGetGradesHistory(courseTaskId);
  const gradesHistoryFiltered = gradesHistory.data?.filter(
    entry =>
      entry.previousState?.userId === studentId ||
      entry.taskGrade?.user.studentNumber === studentId
  );
  console.dir(gradesHistory.data);

  const rows =
    gradesHistoryFiltered?.map((entry, i) => ({
      id: i,
      gradeId: entry.taskGrade?.id ?? entry.previousState?.id ?? 'Error',
      name: entry.courseTaskId,
      actionType: entry.actionType,
      date: entry.updatedAt,
      user: entry.user?.name,
    })) ?? [];

  // console.dir(initRows);
  // const [rows, setRows] = useState<GridRowsProp<ColTypes>>(initRows);
  console.dir(rows);
  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'gradeId',
      headerName: t('general.name'),
      type: 'string',
    },
    {
      field: 'actionType',
      // headerName: t('general.days-valid'),
      type: 'string',
    },
    {
      field: 'date',
      headerName: t('general.date'),
      type: 'dateTime',
    },
    {
      field: 'user',
      headerName: t('general.users'),
      type: 'string',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>History</DialogTitle>
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
              // slots={{toolbar: dataGridToolbar}}
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
              // getRowClassName={getRowClassName as unknown as GetRowClassName}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default GradesHistoryDialog;
