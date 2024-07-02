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
import {ChangeEvent, JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  useAddGrades,
  useFetchAplusGrades,
  useGetCourseParts,
} from '../../hooks/useApi';
import {getAplusToken} from '../../utils/utils';
import AplusTokenDialog from '../shared/AplusTokenDialog';

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusImportDialog = ({handleClose, open}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);

  const [step, setStep] = useState<number>(0);
  const [coursePartIds, setCoursePartIds] = useState<number[]>([]);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const addGrades = useAddGrades(courseId);
  const aplusGrades = useFetchAplusGrades(courseId, coursePartIds, {
    enabled: false,
  });

  useEffect(() => {
    if (step === 1) {
      if (!aplusGrades.isFetching && aplusGrades.data) {
        setStep(2);
        return;
      }

      setAplusTokenDialogOpen(!getAplusToken() || aplusGrades.isError);
    }
  }, [aplusGrades]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (
    event: ChangeEvent<HTMLInputElement>,
    coursePartId: number
  ): void =>
    setCoursePartIds(
      event.target.checked
        ? [...coursePartIds, coursePartId]
        : coursePartIds.filter(id => id !== coursePartId)
    );

  const handleResetAndClose = (): void => {
    setStep(0);
    setCoursePartIds([]);
    setAplusTokenDialogOpen(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleResetAndClose}>
      {step === 0 && <DialogTitle>Select course parts</DialogTitle>}
      {step === 1 && <DialogTitle>Fetching grades</DialogTitle>}
      {step === 2 && <DialogTitle>Confirm</DialogTitle>}
      <DialogContent>
        {step === 0 && (
          <>
            <Typography>
              Select the course parts you want to fetch grades for from A+.
            </Typography>
            <FormGroup>
              {courseParts.data &&
                courseParts.data
                  .filter(coursePart => coursePart.aplusGradeSources.length > 0)
                  .map(coursePart => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={e => handleSelect(e, coursePart.id)}
                        />
                      }
                      label={coursePart.name}
                    />
                  ))}
            </FormGroup>
          </>
        )}
        {step === 1 && (
          <>
            <AplusTokenDialog
              handleClose={handleResetAndClose}
              handleSubmit={() => {
                setAplusTokenDialogOpen(false);
                aplusGrades.refetch();
              }}
              open={aplusTokenDialogOpen}
              error={aplusGrades.isError}
            />
            <Typography>
              Fetching grades from A+, this may take a few minutes...
            </Typography>
            <LinearProgress sx={{mt: 2}} />
          </>
        )}
        {step === 2 && (
          // TODO: We probably want to show a preview in the same table as all
          // other grade uploads, for now this is a simple solution to have
          // some kind of preview.
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student number</TableCell>
                  <TableCell>Course part ID</TableCell>
                  <TableCell>A+ grade source ID</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Expiry date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aplusGrades.data &&
                  aplusGrades.data.map(row => (
                    <TableRow>
                      <TableCell>{row.studentNumber}</TableCell>
                      <TableCell>{row.coursePartId}</TableCell>
                      <TableCell>{row.aplusGradeSourceId}</TableCell>
                      <TableCell>{row.grade}</TableCell>
                      <TableCell>{row.date.toDateString()}</TableCell>
                      <TableCell>{row.expiryDate.toDateString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        {step === 0 && (
          <Button
            onClick={() => {
              setStep(1);
              if (getAplusToken()) {
                aplusGrades.refetch();
              }
            }}
            disabled={coursePartIds.length === 0}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={() => {
              addGrades.mutate(aplusGrades.data!);
              handleResetAndClose();
            }}
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AplusImportDialog;
