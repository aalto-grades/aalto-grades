// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
import {Button, Dialog, DialogActions} from '@mui/material';
import {GridActionsCellItem, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import dayjs, {Dayjs} from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {NewGrade} from '@/common/types';
import UploadDialogConfirm from './UploadDialogConfirm';
import UploadDialogUpload from './UploadDialogUpload';
import {useAddGrades, useGetAttainments} from '../../hooks/useApi';

export type GradeUploadColTypes = {[key: string]: number | null} & {
  id: number;
  studentNo: string;
};

type PropsType = {open: boolean; onClose: () => void};
const UploadDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {courseId} = useParams();
  const attainments = useGetAttainments(courseId!, {enabled: !!courseId});
  const addGrades = useAddGrades(courseId!);

  const attainmentData = useMemo(
    () => attainments.data?.filter(att => !att.archived) ?? [],
    [attainments.data]
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadExpanded, setUploadExpanded] = useState<'' | 'upload' | 'edit'>(
    'upload'
  );
  const [confirmExpanded, setConfirmExpanded] = useState<
    '' | 'date' | 'confirm'
  >('date');
  const [rows, setRows] = useState<GridRowsProp<GradeUploadColTypes>>([]);
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
        expirationDate: dayjs().add(att.daysValid, 'day'),
      }))
    );
  }, [attainmentData, dates.length]);

  const columns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: 'Student Number',
      type: 'string',
      width: 120,
      editable: true,
    },
    ...attainmentData.map(
      (att): GridColDef<GradeUploadColTypes> => ({
        field: att.name,
        headerName: att.name,
        type: 'number',
        editable: true,
      })
    ),
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
  const readOnlycolumns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: 'Student Number',
      type: 'string',
    },
    ...attainmentData.map(
      (att): GridColDef<GradeUploadColTypes> => ({
        field: att.name,
        headerName: att.name,
        type: 'number',
      })
    ),
  ];

  const onSubmit = async (): Promise<void> => {
    const gradeData: NewGrade[] = [];

    for (const row of rows) {
      for (const attainment of attainmentData) {
        const grade = row[attainment.name];
        if (!(attainment.name in row) || grade === null) continue; // Skip empty cells

        const dateData = dates.find(
          date => date.attainmentName === attainment.name
        );
        if (dateData === undefined) {
          console.error('DateData was undefined');
          continue;
        }
        gradeData.push({
          studentNumber: row.studentNo,
          attainmentId: attainment.id,
          grade: grade,
          date: dateData.completionDate.toDate(),
          expiryDate: dateData.expirationDate.toDate(),
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
        expirationDate: dayjs().add(att.daysValid, 'day'),
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
            <Button
              onClick={() => setConfirmExpanded('confirm')}
              disabled={!ready}
            >
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
