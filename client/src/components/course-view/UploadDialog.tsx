// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NewGrade} from '@common/types';
import {Delete} from '@mui/icons-material';
import {Button, Dialog, DialogActions} from '@mui/material';
import {GridActionsCellItem, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import dayjs, {Dayjs} from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useAddGrades, useGetAttainments} from '../../hooks/useApi';
import UploadDialogConfirm from './UploadDialogConfirm';
import UploadDialogUpload from './UploadDialogUpload';

const UploadDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element => {
  const {courseId} = useParams();
  const attainments = useGetAttainments(courseId!, {enabled: !!courseId});
  const addGrades = useAddGrades(courseId!);

  const attainmentData = useMemo(
    () => attainments.data ?? [],
    [attainments.data]
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadExpanded, setUploadExpanded] = useState<'' | 'upload' | 'edit'>(
    'upload'
  );
  const [confirmExpanded, setConfirmExpanded] = useState<
    '' | 'date' | 'confirm'
  >('date');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [dates, setDates] = useState<
    {attainmentName: string; completionDate: Dayjs; expirationDate: Dayjs}[]
  >([]);

  useEffect(() => {
    if (attainmentData.length === dates.length) return;
    setDates(
      attainmentData.map(att => ({
        attainmentName: att.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(att.daysValid as number, 'day'),
      }))
    );
  }, [attainmentData, dates.length]);

  if (attainments.data === undefined) return <></>;

  const columns: GridColDef[] = [
    {
      field: 'StudentNo',
      headerName: 'Student Number',
      type: 'string',
      width: 120,
      editable: true,
    },
    ...attainments.data.map(att => ({
      field: att.name,
      headerName: att.name,
      type: 'number',
      editable: true,
    })),
    {
      field: 'actions',
      type: 'actions',
      getActions: params => [
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() =>
            setRows(oldRows => oldRows.filter(row => row.id !== params.id))
          }
        />,
      ],
    },
  ];
  const readOnlycolumns: GridColDef[] = [
    {
      field: 'StudentNo',
      headerName: 'Student Number',
      type: 'string',
    },
    ...attainments.data.map(att => ({
      field: att.name,
      headerName: att.name,
      type: 'number',
    })),
  ];

  const onSubmit = async (): Promise<void> => {
    const gradeData: NewGrade[] = [];

    for (const row of rows) {
      for (const attainment of attainments.data) {
        if (
          !(attainment.name in row) ||
          row[attainment.name] === null ||
          row[attainment.name] === ''
        )
          continue; // Skip empty cells
        gradeData.push({
          studentNumber: (row.StudentNo as string | number).toString(),
          attainmentId: attainment.id,
          grade: row[attainment.name] as number,
          date: dates
            .find(date => date.attainmentName === attainment.name)
            ?.completionDate.toDate(),
          expiryDate: dates
            .find(date => date.attainmentName === attainment.name)
            ?.expirationDate.toDate(),
          comment: '',
        });
      }
    }

    await addGrades.mutateAsync(gradeData);

    enqueueSnackbar('Grades added successfully.', {
      variant: 'success',
    });

    setCurrentStep(0);
    setUploadExpanded('upload');
    setConfirmExpanded('date');
    setRows([]);
    setDates(
      attainmentData.map(att => ({
        attainmentName: att.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(att.daysValid as number, 'day'),
      }))
    );
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        {currentStep === 0 ? (
          <UploadDialogUpload
            columns={columns}
            rows={rows}
            setRows={setRows}
            setReady={setReady}
            expanded={uploadExpanded}
            setExpanded={setUploadExpanded}
          />
        ) : (
          <UploadDialogConfirm
            columns={readOnlycolumns}
            rows={rows}
            dates={dates}
            setDates={setDates}
            setReady={setReady}
            expanded={confirmExpanded}
            setExpanded={setConfirmExpanded}
          />
        )}

        <DialogActions>
          {currentStep === 1 && (
            <Button
              onClick={() => setCurrentStep(cur => cur - 1)}
              sx={{mr: 'auto'}}
            >
              Back
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              onClick={() => setCurrentStep(cur => cur + 1)}
              disabled={!ready || rows.length === 0}
            >
              Next
            </Button>
          )}
          {currentStep === 1 && confirmExpanded === 'date' && (
            <Button onClick={() => setConfirmExpanded('confirm')}>
              Confirm
            </Button>
          )}
          {currentStep === 1 && confirmExpanded === 'confirm' && (
            <Button onClick={onSubmit}>Submit</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
export default UploadDialog;
