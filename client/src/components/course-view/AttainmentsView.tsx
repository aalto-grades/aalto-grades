// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, SystemRole} from '@common/types';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {JSX, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  AccessTime,
  Delete,
  TableRows,
  TableRowsOutlined,
  Tag,
  Window,
  WindowOutlined,
} from '@mui/icons-material';
import {DataGrid, GridActionsCellItem, GridColDef} from '@mui/x-data-grid';
import {useDeleteAttainment, useGetAttainments} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {Numeric} from '../../types';
import NewAttainmentDialog from './NewAttainmentDialog';

export default function CourseView(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();

  const deleteAttainment = useDeleteAttainment();
  const attainments = useGetAttainments(courseId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [layout, setLayout] = useState<'table' | 'grid'>('table');
  // const {openConfirmDialog} = useConfirmDialog();

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  const handleConfirmDelete = (attId: Numeric): void => {
    deleteAttainment.mutate({courseId, attainmentId: attId});
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      type: 'string',
    },
    {
      field: 'name',
      headerName: 'Title',
      type: 'string',
      width: 120,
      editable: true,
    },
    {
      field: 'daysValid',
      headerName: 'Days valid',
      type: 'number',
      width: 120,
      editable: true,
    },
    {
      field: 'dateValid',
      headerName: 'Date valid',
      type: 'date',
      width: 120,
      editable: true,
    },
    ...(editRights
      ? [
          {
            field: 'actions',
            type: 'actions',
            getActions: params => [
              <GridActionsCellItem
                icon={<Delete />}
                label="Delete"
                onClick={() => handleConfirmDelete(params.id)}
              />,
            ],
          } as GridColDef,
        ]
      : []),
  ];

  return (
    <>
      <Box sx={{display: 'flex', mb: 1}}>
        {editRights && (
          <Button onClick={() => setAddDialogOpen(true)}>Add attainment</Button>
        )}
        <ButtonGroup>
          <Button onClick={() => setLayout('table')}>
            {layout === 'table' ? <TableRows /> : <TableRowsOutlined />}
          </Button>
          <Button onClick={() => setLayout('grid')}>
            {layout === 'grid' ? <Window /> : <WindowOutlined />}
          </Button>
        </ButtonGroup>
      </Box>

      {layout === 'grid' && (
        <Box
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {attainments.data &&
            attainments.data.map((attainment: AttainmentData) => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                key={attainment.id}
              >
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'info.grey',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography sx={{py: 1.7}}>{attainment.name}</Typography>
                  <Chip
                    icon={<Tag />}
                    label={`${attainment.id}`}
                    variant="outlined"
                    size="small"
                    sx={{mr: 1}}
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={`${attainment.daysValid} days`}
                    variant="outlined"
                    size="small"
                  />

                  {editRights && (
                    <IconButton
                      onClick={() => handleConfirmDelete(attainment.id)}
                      aria-description="delete attainment"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
        </Box>
      )}
      {layout === 'table' && (
        <DataGrid
          rows={attainments.data || []}
          columns={columns}
          rowHeight={25}
          editMode="row"
          rowSelection={false}
          disableColumnSelector
          // slots={{toolbar: dataGridToolbar}}
          sx={{maxHeight: '70vh', minHeight: '20vh'}}
          // onRowEditStart={() => setEditing(true)}
          // onRowEditStop={() => setEditing(false)}
          // processRowUpdate={updatedRow => {
          //   setRows(oldRows =>
          //     oldRows.map(row => (row.id === updatedRow.id ? updatedRow : row))
          //   );
          //   // TODO: do some validation. Code below is an example.
          //   // for (const [key, val] of Object.entries(updatedRow)) {
          //   //   if (key === 'id' || key === 'StudentNo') continue;
          //   //   if ((val as number) < 0)
          //   //     throw new Error('Value cannot be negative');
          //   //   else if ((val as number) > 5000)
          //   //     throw new Error('Value cannot be over 5000');
          //   // }
          //   // setSnackBar({message: 'Row saved!', severity: 'success'});
          //   setError(false);
          //   return updatedRow;
          // }}
          // onProcessRowUpdateError={error => {
          //   setError(true);
          //   setSnackBar({message: error.message, severity: 'error'});
          // }}
        />
      )}

      <NewAttainmentDialog
        handleClose={() => setAddDialogOpen(false)}
        open={addDialogOpen}
      />
    </>
  );
}
