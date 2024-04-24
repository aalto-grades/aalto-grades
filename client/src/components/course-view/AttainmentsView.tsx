// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AccessTime,
  Delete,
  TableRows,
  TableRowsOutlined,
  Tag,
  Window,
  WindowOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useBlocker, useParams} from 'react-router-dom';

import {EditAttainmentData, NewAttainmentData, SystemRole} from '@common/types';
import {enqueueSnackbar} from 'notistack';
import {
  useAddAttainment,
  useDeleteAttainment,
  useEditAttainment,
  useGetAttainments,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {Numeric} from '../../types';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import NewAttainmentDialog from './NewAttainmentDialog';

type ColTypes = {
  id: number;
  attainmentId: number;
  name: string;
  daysValid: number;
  dateValid: Date | null;
};

const AttainmentsView = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();

  const attainments = useGetAttainments(courseId);
  const addAttainment = useAddAttainment(courseId);
  const editAttainment = useEditAttainment(courseId);
  const deleteAttainment = useDeleteAttainment(courseId);

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [layout, setLayout] = useState<'table' | 'grid'>('table');
  const [layoutChange, setLayoutChange] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState<boolean>(false);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  const unsavedChanges = useMemo(
    () => JSON.stringify(initRows) !== JSON.stringify(rows),
    [initRows, rows]
  );

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      unsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (attainments.data === undefined) return;
    const newRows = attainments.data.map(att => ({
      id: att.id,
      attainmentId: att.id,
      name: att.name,
      daysValid: att.daysValid,
      dateValid: null,
    }));
    if (JSON.stringify(newRows) === JSON.stringify(rows)) return;
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }, [attainments.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsavedChanges]);

  const handleAddAttainment = async (
    name: string,
    daysValid: number
  ): Promise<void> => {
    if (layout === 'grid') {
      await addAttainment.mutateAsync({name, daysValid});
    } else {
      setRows(oldRows => {
        const freeId =
          oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
        return oldRows.concat({
          id: freeId,
          attainmentId: -1,
          name,
          daysValid,
          dateValid: null,
        });
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const newAttainments: NewAttainmentData[] = [];
    const deletedAttainments: number[] = [];
    const editedAttainments: ({attainmentId: number} & EditAttainmentData)[] =
      [];

    for (const row of rows) {
      if (row.attainmentId === -1) {
        newAttainments.push({
          name: row.name,
          daysValid: row.daysValid,
        });
      } else {
        editedAttainments.push({
          attainmentId: row.attainmentId,
          name: row.name,
          daysValid: row.daysValid,
        });
      }
    }

    const newAttIds = rows.map(row => row.attainmentId);
    for (const initRow of initRows) {
      if (!newAttIds.includes(initRow.attainmentId))
        deletedAttainments.push(initRow.attainmentId);
    }

    await Promise.all([
      ...newAttainments.map(att => addAttainment.mutateAsync(att)),
      ...deletedAttainments.map(attId => deleteAttainment.mutateAsync(attId)),
      ...editedAttainments.map(att =>
        editAttainment.mutateAsync({
          attainmentId: att.attainmentId,
          attainment: att,
        })
      ),
    ]);

    enqueueSnackbar('Attainments saved successfully', {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  const handleConfirmDelete = (attId: Numeric): void => {
    deleteAttainment.mutate(attId);
  };

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'name',
      headerName: 'Name',
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
                onClick={() =>
                  setRows(oldRows =>
                    oldRows.filter(row => row.id !== params.id)
                  )
                }
              />,
            ],
          } as GridColDef,
        ]
      : []),
  ];

  return (
    <>
      <NewAttainmentDialog
        handleClose={() => setAddDialogOpen(false)}
        open={addDialogOpen}
        onSave={handleAddAttainment}
      />
      <UnsavedChangesDialog
        open={unsavedDialogOpen || blocker.state === 'blocked'}
        onClose={() => {
          setUnsavedDialogOpen(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
        handleDiscard={() => {
          setRows(structuredClone(initRows));

          if (layoutChange) {
            setLayoutChange(false);
            setLayout('grid');
          } else if (blocker.state === 'blocked') {
            blocker.proceed();
          }
        }}
      />

      <Box sx={{display: 'flex', mb: 1}}>
        {editRights && (
          <Button onClick={() => setAddDialogOpen(true)}>Add attainment</Button>
        )}
        <ButtonGroup>
          <Button onClick={() => setLayout('table')}>
            {layout === 'table' ? <TableRows /> : <TableRowsOutlined />}
          </Button>
          <Button
            onClick={() => {
              if (unsavedChanges) {
                setLayoutChange(true);
                setUnsavedDialogOpen(true);
              } else setLayout('grid');
            }}
          >
            {layout === 'grid' ? <Window /> : <WindowOutlined />}
          </Button>
        </ButtonGroup>
        {editRights && layout === 'table' && (
          <div style={{marginLeft: '10px'}}>
            {unsavedChanges && (
              <Button onClick={() => setUnsavedDialogOpen(true)}>
                Discard
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              variant={unsavedChanges ? 'contained' : 'text'}
              disabled={error || editing}
            >
              Save
            </Button>
          </div>
        )}
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
            attainments.data.map(attainment => (
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
          rows={rows}
          columns={columns}
          rowHeight={25}
          editMode="row"
          rowSelection={false}
          disableColumnSelector
          sx={{maxHeight: '70vh', minHeight: '20vh'}}
          onRowEditStart={() => setEditing(true)}
          onRowEditStop={() => setEditing(false)}
          processRowUpdate={updatedRow => {
            setRows(oldRows =>
              oldRows.map(row => (row.id === updatedRow.id ? updatedRow : row))
            );
            // TODO: do some validation. Code below is an example.
            // for (const [key, val] of Object.entries(updatedRow)) {
            //   if (key === 'id' || key === 'StudentNo') continue;
            //   if ((val as number) < 0)
            //     throw new Error('Value cannot be negative');
            //   else if ((val as number) > 5000)
            //     throw new Error('Value cannot be over 5000');
            // }
            // setSnackBar({message: 'Row saved!', severity: 'success'});
            setError(false);
            return updatedRow;
          }}
          onProcessRowUpdateError={(rowError: Error) => {
            setError(true);
            enqueueSnackbar(rowError.message, {variant: 'error'});
          }}
        />
      )}
    </>
  );
};

export default AttainmentsView;
