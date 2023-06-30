// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX, useEffect, useState }  from 'react';
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

  const [attainmentTree, setAttainmentTree]: State<AttainmentData> = useState(null);
  const [deletedAttainments, setDeletedAttainments]: State<Array<AttainmentData>> = useState([]);

  const [openConfDialog, setOpenConfDialog]: State<boolean> = useState(false);

  useEffect(() => {
    attainmentServices.getAttainment(courseId, assessmentModelId, attainmentId, 'descendants')
      .then((attainment: AttainmentData) => {
        setAttainmentTree(attainment);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  // Function to edit the data that is in the database
  async function editAttainment(attainmentObject): Promise<void> {
    try {
      const attainment = await attainmentServices.editAttainment(
        courseId, assessmentModelId, attainmentObject
      );

      console.log(attainment);
      //navigate('/' + courseId, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  }

  // Function to add data to the database
  async function addAttainment(attainmentObject): Promise<void> {
    try {
      const attainment = await attainmentServices.addAttainment(
        courseId, assessmentModelId, attainmentObject
      );

      console.log(attainment);
      //navigate('/' + courseId, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  }

  // Function to delete data from the database or from the context
  async function deleteAttainment(attainmentId): Promise<void> {
    // If this view is opened from the course view, delete from DB
    // Else the attainment is being edited during the creation of an instance
    // so only delete from the context
    if (assessmentModelId) {
      try {
        await attainmentServices.deleteAttainment(courseId, assessmentModelId, attainmentId);
      } catch (exception) {
        console.log(exception.message);
      }
    }/* else if (sisuInstanceId) {
      const updatedAttainments = attainmentServices.deleteTemporaryAttainment(
        addedAttainments, attainments[0]
      );

      setAddedAttainments(updatedAttainments);
    }*/
    navigate(-1);
  }

  function handleSubmit(event): void {
    event.preventDefault();
    try {
      // If this view is opened from the course view, update DB
      // Else the attainment is being edited during the creation of an
      // instance so only update the context
      if (assessmentModelId) {
        //const updatedAttainments = attainmentServices.formatStringsToDates(attainments);
        //const existingAttainments = attainmentServices.getExistingAttainments(updatedAttainments);
        //const newAttainments = attainmentServices.getNewAttainments(updatedAttainments);
        //existingAttainments.forEach((attainment) => editAttainment(attainment));
        //newAttainments.forEach((attainment) => addAttainment(attainment));
        //deletedAttainments.forEach((attainment) => {
        //  if (attainment.id)
        //    deleteAttainment(attainment.id);
        //});
        attainmentServices.editAttainment(
          courseId, assessmentModelId, attainmentTree
        );
        navigate(-1);
      }
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

  // A function that temporarily removes an attainment from the 'attainments',
  // and then this attainment is deleted as are also the 'deletedAttainments'
  // when the Confirm or Delete Attainment buttons are pressed
  function removeAttainment(indices): void {
    if (JSON.stringify(indices) === '[0]') {
      deleteAttainment(attainmentId);
    } else {
      //const deletedAttainment = attainmentServices.getAttainmentByIndices(indices, attainments);
      //const updatedAttainments = attainmentServices.removeAttainment(indices, attainments);
      //setDeletedAttainments([...deletedAttainments, deletedAttainment]);
      //setAttainments(updatedAttainments);
    }
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
                attainment={attainmentTree}
                removeAttainment={removeAttainment}
              />
            }
          </Box>
          <ConfirmationDialog
            title={'Study Attainment'}
            subject={'study attainment'}
            open={openConfDialog}
            handleClose={handleConfDialogClose}
            deleteAttainment={removeAttainment}
            indices={[0]}
            attainments={[attainmentTree]}
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
