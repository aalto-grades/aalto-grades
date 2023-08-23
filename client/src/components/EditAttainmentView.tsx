// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula, GradeType } from 'aalto-grades-common/types';
import { Box, Button, Container, Typography } from '@mui/material';
import { JSX, SyntheticEvent, useState }  from 'react';
import { NavigateFunction, Params, useParams, useNavigate } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import UnsavedChangesDialog from './alerts/UnsavedChangesDialog';
import Attainment from './edit-attainment-view/Attainment';
import ConfirmationDialog from './edit-attainment-view/ConfirmationDialog';
import NotFound from './NotFound';

import {
  useAddAttainment, UseAddAttainmentResult,
  useDeleteAttainment, UseDeleteAttainmentResult,
  useEditAttainment, UseEditAttainmentResult,
  useGetAttainment
} from '../hooks/useApi';
import { State } from '../types';

export default function EditAttainmentView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  // attainmentId is either the root attainment of an assessment model when
  // creating a new attainment or the ID of an attainment being edited.
  const { courseId, assessmentModelId, modification, attainmentId }: Params = useParams();

  // Check for invalid paths
  if (
    (modification === 'create' && attainmentId)
      || (modification === 'edit' && !attainmentId)
      || (modification !== 'create' && modification !== 'edit')
  ) {
    return (
      <NotFound/>
    );
  }

  /*
   * The current state of the tree of attainments being edited.
   *
   * In this tree, attainments which have a positive ID exist in the database
   * and are to be updated. Attainments which have a negative ID do not exist
   * in the database and are to be added. Attainments to be deleted are added
   * to the deletedAttainments list and removed from this tree.
   */
  const [attainmentTree, setAttainmentTree]: State<AttainmentData | null> =
    useState<AttainmentData | null>(null);

  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const [fieldTouched, setFieldTouched]: State<boolean> = useState<boolean>(false);

  // If an attainment is being edited, this query is enabled
  const attainment: UseQueryResult<AttainmentData> = useGetAttainment(
    courseId ?? -1, assessmentModelId ?? -1, attainmentId ?? -1, 'descendants',
    { enabled: Boolean(courseId && assessmentModelId && attainmentId), cacheTime: 0 }
  );

  if (!attainmentTree) {
    if (modification === 'create') {
      setAttainmentTree({
        id: -1,
        parentId: Number(attainmentId),
        name: '',
        daysValid: 0,
        minRequiredGrade: 1,
        maxGrade: 5,
        formula: Formula.Manual,
        formulaParams: {},
        subAttainments: [],
        gradeType: GradeType.Float
      });
    } else if (modification === 'edit' && attainment.data) {
      setAttainmentTree(attainment.data);
    }
  }

  // List of attainments that exist in the database which are to be deleted.
  const [deletedAttainments, setDeletedAttainments]: State<Array<AttainmentData>> =
    useState<Array<AttainmentData>>([]);

  /*
   * Temporary IDs for attainments that have not been added to the database yet
   * and only exist in the client. Temporary IDs are negative to differentiate
   * them from database IDs and to avoid conflicts between them.
   */
  const [temporaryId, setTemporaryId]: State<number> = useState(-2);

  const [openConfDialog, setOpenConfDialog]: State<boolean> = useState(false);

  const addAttainment: UseAddAttainmentResult = useAddAttainment();
  const deleteAttainment: UseDeleteAttainmentResult = useDeleteAttainment();
  const editAttainment: UseEditAttainmentResult = useEditAttainment();

  function getTemporaryId(): number {
    const id: number = temporaryId;
    setTemporaryId(temporaryId - 1);
    return id;
  }

  function setTouched(): void {
    setFieldTouched(true);
  }

  function deleteAttainmentEnqueue(attainment: AttainmentData): void {
    if (attainment.id === attainmentTree?.id) {
      if (attainment.id && attainment.id > 0 && (courseId && assessmentModelId && attainmentId)) {
        deleteAttainment.mutate({
          courseId: courseId,
          assessmentModelId: assessmentModelId,
          attainmentId: attainment.id
        });
      }

      setAttainmentTree(null);
      navigate(-1);
      return;
    }

    function inner(attainment: AttainmentData, tree: AttainmentData): void {
      for (const i in tree.subAttainments) {
        const subAttainment: AttainmentData = tree.subAttainments[Number(i)];

        if (subAttainment.id === attainment.id) {
          // Attainments that aren't saved in the database don't need to be
          // stored in deletedAttainments since there is no need to delete them
          // from anywhere except the UI.
          if (attainment.id && attainment.id > 0) {
            setDeletedAttainments([...deletedAttainments, structuredClone(attainment)]);
          }

          tree.subAttainments.splice(Number(i), 1);
          setAttainmentTree(structuredClone(attainmentTree));
          return;
        }

        inner(attainment, subAttainment);
      }
    }

    if (attainmentTree)
      inner(attainment, attainmentTree);
  }

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();

    const deleteQueue: Array<AttainmentData> = deletedAttainments;
    const addQueue: Array<AttainmentData> = [];
    const editQueue: Array<AttainmentData> = [];
    function constructQueues(tree: AttainmentData): void {
      if (tree.id && tree.id > 0) {
        editQueue.push(tree);

        if (tree.subAttainments) {
          for (const subAttainment of tree.subAttainments) {
            constructQueues(subAttainment);
          }
        }
      } else {
        addQueue.push(tree);
      }
    }

    function nextChange(): void {
      function options(queue: Array<AttainmentData>): object {
        return {
          onSuccess: (): void => {
            queue.splice(0, 1);
            nextChange();
          }
        };
      }

      if (!courseId || !assessmentModelId)
        return;

      // Delete attainments -> Add new attainments -> Edit existing attainments
      if (deleteQueue.length > 0) {
        if (deleteQueue[0].id) {
          deleteAttainment.mutate({
            courseId, assessmentModelId,
            attainmentId: deleteQueue[0].id
          }, options(deleteQueue));
        }
      } else if (addQueue.length > 0) {
        addAttainment.mutate({
          courseId, assessmentModelId,
          attainment: addQueue[0]
        }, options(addQueue));
      } else if (editQueue.length > 0) {
        editAttainment.mutate({
          courseId, assessmentModelId,
          attainment: editQueue[0]
        }, options(editQueue));
      }
    }

    if (courseId && assessmentModelId) {
      if (attainmentTree) {
        if (modification === 'create') {
          addAttainment.mutate({
            courseId: courseId,
            assessmentModelId: assessmentModelId,
            attainment: attainmentTree
          });
        } else if (modification === 'edit') {
          constructQueues(attainmentTree);
          nextChange();
        }
      }
    }

    navigate(-1);
  }

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        {
          (modification === 'create') ? (
            <Typography variant="h1" align='left' sx={{ flexGrow: 1, mb: 4 }}>
              Create Study Attainment
            </Typography>
          ) : (
            <Typography variant="h1" align='left' sx={{ flexGrow: 1, mb: 4 }}>
              Edit Study Attainment
            </Typography>
          )
        }
        <form>
          <Box sx={{
            bgcolor: 'primary.light',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            my: 2,
            pt: 3,
            pb: 1,
            px: 2,
          }}>
            {
              (attainmentTree) && (
                <Attainment
                  attainmentTree={attainmentTree}
                  setAttainmentTree={setAttainmentTree}
                  deleteAttainment={deleteAttainmentEnqueue}
                  getTemporaryId={getTemporaryId}
                  attainment={attainmentTree}
                  setTouched={setTouched}
                />
              )
            }
          </Box>
          {
            (attainmentTree) && (
              <ConfirmationDialog
                deleteAttainment={deleteAttainmentEnqueue}
                attainment={attainmentTree}
                title={'Study Attainment'}
                subject={'study attainment'}
                handleClose={(): void => setOpenConfDialog(false)}
                open={openConfDialog}
              />
            )
          }
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'right',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            mb: 1
          }}>
            <Button
              size='medium'
              variant='outlined'
              color={fieldTouched ? 'error' : 'primary'}
              onClick={(): void => {
                if (fieldTouched) {
                  setShowDialog(true);
                } else {
                  navigate(-1);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              size='medium'
              variant='contained'
              type='submit'
              onClick={handleSubmit}
              sx={{ mr: 2 }}
            >
              Submit
            </Button>
          </Box>
        </form>
        <UnsavedChangesDialog
          setOpen={setShowDialog}
          open={showDialog}
          handleDiscard={(): void => navigate(-1)}
        />
      </Container>
    </>
  );
}
