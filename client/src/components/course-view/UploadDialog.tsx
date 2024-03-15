import {NewGrade} from '@common/types';
import {Delete} from '@mui/icons-material';
import {Button, Dialog, DialogActions} from '@mui/material';
import {GridActionsCellItem, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import dayjs, {Dayjs} from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useAddGrades, useGetAttainments} from '../../hooks/useApi';
import useSnackPackAlerts from '../../hooks/useSnackPackAlerts';
import AlertSnackbar from '../alerts/AlertSnackbar';
import UploadDialogConfirm from './UploadDialogConfirm';
import UploadDialogUpload from './UploadDialogUpload';

const UploadDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const attainments = useGetAttainments(courseId);
  const addGrades = useAddGrades(courseId);
  const snackPack = useSnackPackAlerts();

  const attainmentData = useMemo(
    () => attainments.data ?? [],
    [attainments.data]
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [dates, setDates] = useState<
    {attainmentName: string; completionDate: Dayjs; expirationDate: Dayjs}[]
  >(
    attainmentData.map(att => ({
      attainmentName: att.name,
      completionDate: dayjs(),
      expirationDate: dayjs().add(att.daysValid as number, 'day'),
    }))
  );
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    if (init || attainmentData.length === 0) return;
    setDates(
      attainmentData.map(att => ({
        attainmentName: att.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(att.daysValid as number, 'day'),
      }))
    );
    setInit(true);
  }, [attainmentData, init]);

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
          studentNumber: row.StudentNo.toString(),
          attainmentId: attainment.id,
          grade: row[attainment.name],
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

    snackPack.push({
      msg: 'Grades added successfully.',
      severity: 'success',
    });

    setCurrentStep(0);
    setRows([]);
    setDates(
      attainmentData.map(att => ({
        attainmentName: att.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(att.daysValid as number, 'day'),
      }))
    );
    setInit(false);
    onClose();
  };

  return (
    <>
      <AlertSnackbar snackPack={snackPack} />

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
        {currentStep === 0 ? (
          <UploadDialogUpload
            columns={columns}
            rows={rows}
            setRows={setRows}
            setReady={setReady}
          />
        ) : (
          <UploadDialogConfirm
            columns={readOnlycolumns}
            rows={rows}
            dates={dates}
            setDates={setDates}
            setReady={setReady}
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
          {currentStep === 1 && (
            <Button onClick={onSubmit} disabled={!ready}>
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
export default UploadDialog;
