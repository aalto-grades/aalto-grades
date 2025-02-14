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
import {enqueueSnackbar} from 'notistack';
import {
  type ChangeEvent,
  type JSX,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import TokenDialog from '@/components/shared/auth/TokenDialog';
import {
  useAddGrades,
  useFetchAplusGrades,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';
import {getToken} from '@/utils';

type PropsType = {open: boolean; onClose: () => void};
const AplusImportDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addGrades = useAddGrades(courseId);

  const [step, setStep] = useState<number>(0);
  const [courseTaskIds, setCourseTaskIds] = useState<number[]>([]);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const aplusGrades = useFetchAplusGrades(courseId, courseTaskIds, {
    enabled: false,
  });

  const handleResetAndClose = useCallback(() => {
    setStep(0);
    setCourseTaskIds([]);
    setAplusTokenDialogOpen(false);
    onClose();
  }, [onClose]);

  // Must be a useEffect to be able to call enqueueSnackbar & onClose :/
  useEffect(() => {
    if (step !== 1) return;

    if (!aplusGrades.data) {
      setAplusTokenDialogOpen(!getToken('a+') || aplusGrades.isError);
    } else if (aplusGrades.data.length === 0) {
      enqueueSnackbar(t('course.parts.no-aplus-grades'), {
        variant: 'warning',
      });
      handleResetAndClose();
    } else {
      setStep(2);
    }
  }, [aplusGrades.data, aplusGrades.isError, handleResetAndClose, step, t]);

  const handleSelect = (
    event: ChangeEvent<HTMLInputElement>,
    courseTaskId: number
  ): void =>
    setCourseTaskIds(
      event.target.checked
        ? [...courseTaskIds, courseTaskId]
        : courseTaskIds.filter(id => id !== courseTaskId)
    );

  const gradesHaveExpiryDates = aplusGrades.data?.some(
    row => row.expiryDate !== null
  );

  const coursePartNames = Object.fromEntries(
    courseParts.data?.map(part => [part.id, part.name]) ?? []
  );

  return (
    <>
      <TokenDialog
        open={aplusTokenDialogOpen}
        onClose={handleResetAndClose}
        onSubmit={() => {
          setAplusTokenDialogOpen(false);
          aplusGrades.refetch();
        }}
        tokenType="a+"
        error={aplusGrades.isError}
      />
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
            <DialogActions>
              <Button
                onClick={() => {
                  setStep(1);
                  if (getToken('a+')) aplusGrades.refetch();
                  else setAplusTokenDialogOpen(true);
                }}
                disabled={courseTaskIds.length === 0}
              >
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 1 && (
          <>
            <DialogTitle>{t('course.parts.fetching-grades')}</DialogTitle>
            <DialogContent>
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
            <DialogActions>
              <Button
                onClick={() => {
                  addGrades.mutate(aplusGrades.data!);
                  handleResetAndClose();
                }}
              >
                {t('general.submit')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default AplusImportDialog;
