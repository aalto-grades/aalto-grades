// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {type ChangeEvent, type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import AplusTokenDialog from '@/components/shared/auth/AplusTokenDialog';
import {
  useAddGrades,
  useFetchAplusGrades,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';
import {getAplusToken} from '@/utils';

type PropsType = {open: boolean; onClose: () => void};
const AplusImportDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);

  const [step, setStep] = useState<number>(0);
  const [courseTaskIds, setCourseTaskIds] = useState<number[]>([]);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const addGrades = useAddGrades(courseId);
  const aplusGrades = useFetchAplusGrades(courseId, courseTaskIds, {
    enabled: false,
  });

  const [oldAplusGrades, setOldAplusGrades] = useState<
    typeof aplusGrades | null
  >(null);
  if (JSON.stringify(aplusGrades) !== JSON.stringify(oldAplusGrades)) {
    setOldAplusGrades(aplusGrades);

    if (step === 1) {
      if (!aplusGrades.isFetching && aplusGrades.data) {
        setStep(2);
      } else {
        setAplusTokenDialogOpen(!getAplusToken() || aplusGrades.isError);
      }
    }
  }

  const handleSelect = (
    event: ChangeEvent<HTMLInputElement>,
    courseTaskId: number
  ): void =>
    setCourseTaskIds(
      event.target.checked
        ? [...courseTaskIds, courseTaskId]
        : courseTaskIds.filter(id => id !== courseTaskId)
    );

  const handleResetAndClose = (): void => {
    setStep(0);
    setCourseTaskIds([]);
    setAplusTokenDialogOpen(false);
    onClose();
  };

  const gradesHaveExpiryDates = aplusGrades.data?.some(
    row => row.expiryDate !== null
  );

  const coursePartNames = Object.fromEntries(
    courseParts.data?.map(part => [part.id, part.name]) ?? []
  );

  return (
    <Dialog open={open} onClose={handleResetAndClose} maxWidth="md" fullWidth>
      {step === 0 && (
        <>
          <DialogTitle>{t('course.parts.select-course-tasks')}</DialogTitle>
          <DialogContent>
            <Typography>{t('course.parts.select-for-fetching')}</Typography>
            <FormGroup>
              {courseTasks.data
                ?.filter(task => task.aplusGradeSources.length > 0)
                .map(task => {
                  const partName = coursePartNames[task.coursePartId];
                  const coursePartString = partName ? `${partName} -> ` : '';
                  return (
                    <FormControlLabel
                      key={task.id}
                      control={
                        <Checkbox onChange={e => handleSelect(e, task.id)} />
                      }
                      label={`${coursePartString}${task.name}`}
                    />
                  );
                })}
            </FormGroup>
          </DialogContent>
        </>
      )}
      {step === 1 && (
        <>
          <DialogTitle>{t('course.parts.fetching-grades')}</DialogTitle>
          <DialogContent>
            <AplusTokenDialog
              open={aplusTokenDialogOpen}
              onClose={handleResetAndClose}
              onSubmit={() => {
                setAplusTokenDialogOpen(false);
                aplusGrades.refetch();
              }}
              error={aplusGrades.isError}
            />
            <Typography>{t('course.parts.fetching-grades-wait')}</Typography>
            <LinearProgress sx={{mt: 2}} />
          </DialogContent>
        </>
      )}
      {step === 2 && (
        <>
          <DialogTitle>{t('general.confirm')}</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('general.student-number')}</TableCell>
                    <TableCell>{t('general.course-task')}</TableCell>
                    <TableCell>{t('general.grade')}</TableCell>
                    <TableCell>{t('general.date')}</TableCell>
                    {gradesHaveExpiryDates && (
                      <TableCell>{t('general.expiry-date')}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aplusGrades.data?.map(row => (
                    <TableRow key={row.studentNumber}>
                      <TableCell>{row.studentNumber}</TableCell>
                      <TableCell>
                        {
                          courseTasks.data!.find(
                            task => task.id === row.courseTaskId
                          )!.name
                        }
                      </TableCell>
                      <TableCell>{row.grade}</TableCell>
                      <TableCell>{row.date.toDateString()}</TableCell>
                      {gradesHaveExpiryDates && (
                        <TableCell>
                          {row.expiryDate === null
                            ? ''
                            : row.expiryDate.toDateString()}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </>
      )}
      <DialogActions>
        {step === 0 && (
          <Button
            onClick={() => {
              setStep(1);
              if (getAplusToken()) {
                aplusGrades.refetch();
              }
            }}
            disabled={courseTaskIds.length === 0}
          >
            {t('general.next')}
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={() => {
              addGrades.mutate(aplusGrades.data!);
              handleResetAndClose();
            }}
          >
            {t('general.submit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AplusImportDialog;
