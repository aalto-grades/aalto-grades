// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX, SyntheticEvent, useEffect, useState }  from 'react';
import { NavigateFunction, Params, useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Attainment from './create-attainment/Attainment';
import ConfirmationDialog from './create-attainment/ConfirmationDialog';
import attainmentServices from '../services/attainments';
import { AttainmentData } from 'aalto-grades-common/types';
import { State } from '../types';

function EditAttainmentView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, assessmentModelId, attainmentId }: Params = useParams();

  /*
   * The current state of the tree of attainments being edited.
   *
   * In this tree, attainments which have a positive ID exist in the database
   * and are to be updated. Attainments which have a negative ID do not exist
   * in the database and are to be added. Attainments to be deleted are added
   * to the deletedAttainments list and removed from this tree.
   */
  const [attainmentTree, setAttainmentTree]: State<AttainmentData> = useState(null);

  // List of attainments that exist in the database which are to be deleted.
  const [deletedAttainments, setDeletedAttainments]: State<Array<AttainmentData>> = useState([]);

  /*
   * Temporary IDs for attainments that have not been added to the database yet
   * and only exist in the client. Temporary IDs are negative to differentiate
   * them from database IDs and to avoid conflicts between them.
   */
  const [temporaryId, setTemporaryId]: State<number> = useState(-1);

  const [openConfDialog, setOpenConfDialog]: State<boolean> = useState(false);

  useEffect(() => {
    attainmentServices.getAttainment(courseId, assessmentModelId, attainmentId, 'descendants')
      .then((attainment: AttainmentData) => {
        setAttainmentTree(attainment);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  function getTemporaryId(): number {
    const id: number = temporaryId;
    setTemporaryId(temporaryId - 1);
    return id;
  }

  function deleteAttainment(attainment: AttainmentData): void {
    if (attainment.id === attainmentTree.id) {
      if (attainment.id > 0)
        setDeletedAttainments([...deletedAttainments, structuredClone(attainment)]);

      setAttainmentTree(null);
      return;
    }

    function inner(attainment: AttainmentData, tree: AttainmentData) {
      for (const i in tree.subAttainments) {
        const subAttainment: AttainmentData = tree.subAttainments[i];

        if (subAttainment.id === attainment.id) {
          if (attainment.id > 0)
            setDeletedAttainments([...deletedAttainments, structuredClone(attainment)]);

          tree.subAttainments.splice(Number(i), 1);
          setAttainmentTree(structuredClone(attainmentTree));
          return;
        }

        inner(attainment, subAttainment);
      }
    }

    inner(attainment, attainmentTree);
  }

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();

    function addAndEdit(tree: AttainmentData): void {
      if (!tree.subAttainments)
        return;

      for (const subAttainment of tree.subAttainments) {
        if (subAttainment.id > 0) {
          attainmentServices.editAttainment(courseId, assessmentModelId, subAttainment);
          addAndEdit(subAttainment);
        } else {
          attainmentServices.addAttainment(courseId, assessmentModelId, subAttainment);
        }
      }
    }

    try {
      for (const attainment of deletedAttainments)
        attainmentServices.deleteAttainment(courseId, assessmentModelId, attainment.id);

      attainmentServices.editAttainment(courseId, assessmentModelId, attainmentTree);
      addAndEdit(attainmentTree);

      navigate(-1);
    } catch (exception) {
      console.log(exception);
    }
  }

  // Functions for opening and closing the dialog for confirming attainment deletion

  function handleConfDialogOpen(): void {
    setOpenConfDialog(true);
  }

  function handleConfDialogClose(): void {
    setOpenConfDialog(false);
  }

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" align='left' sx={{ flexGrow: 1, mb: 4 }}>
          Edit Study Attainment
        </Typography>
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
              attainmentTree &&
              <Attainment
                attainmentTree={attainmentTree}
                setAttainmentTree={setAttainmentTree}
                deleteAttainment={deleteAttainment}
                getTemporaryId={getTemporaryId}
                attainment={attainmentTree}
              />
            }
          </Box>
          <ConfirmationDialog
            deleteAttainment={deleteAttainment}
            attainment={attainmentTree}
            title={'Study Attainment'}
            subject={'study attainment'}
            handleClose={handleConfDialogClose}
            open={openConfDialog}
          />
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: 1, mt: 2, mb: 1
          }}>
            <Button
              size='medium'
              variant='outlined'
              color='error'
              onClick={handleConfDialogOpen}
              sx={{ ml: 2 }}
            >
              Delete Attainment
            </Button>
            <Box sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
              alignItems: 'center', gap: 1
            }}>
              <Button size='medium' variant='outlined' onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                size='medium'
                variant='contained'
                type='submit'
                onClick={handleSubmit}
                sx={{ mr: 2 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </form>
      </Container>
    </>
  );
}

export default EditAttainmentView;
