// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState }  from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Attainment from './create-attainment/Attainment';
import ConfirmationDialog from './create-attainment/ConfirmationDialog';
import attainmentServices from '../services/attainments';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

function EditAttainmentView() {
  const navigate = useNavigate();
  const { courseId, instanceId, sisuInstanceId, attainmentId } = useParams();
  let addedAttainments, setAddedAttainments, attainmentIncrementId, setIncrementId;

  // If this view is opened during the creation of an instance, get the necessary
  // data from the context
  if (sisuInstanceId) {
    (
      {
        addedAttainments, setAddedAttainments,
        attainmentIncrementId, setIncrementId
      } = useOutletContext<any>());
  }

  function getAttainment() {
    // If this view is opened from the course view, get attainment from DB
    // Else the attainment is being edited during the creation of an instance so
    // gotten from the context
    if (instanceId) {
      // TODO: replace with a function that gets the actual data from the server
      return attainmentServices.getFinalAttainmentById(
        mockAttainmentsClient, Number(attainmentId)
      );
    } else if (sisuInstanceId && addedAttainments.length !== 0) {
      let attainment = addedAttainments.find(attainment => {
        return attainment.temporaryId === Number(attainmentId);
      });
      if (attainment) {
        attainment = attainmentServices.formatDates([attainment]);
        return attainment;
      } else {
        console.log('Attainment could not be found');
      }
    } else {
      console.log('Attainment could not be found');
    }
  }

  const [attainments, setAttainments] = useState(getAttainment());
  const [deletedAttainments, setDeletedAttainments] = useState([]);

  // Function to edit the data that is in the database
  async function editAttainment(attainmentObject): Promise<void> {
    try {
      const attainment = await attainmentServices.editAttainment(
        courseId, instanceId, attainmentObject
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
        courseId, instanceId, attainmentObject
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
    if (instanceId) {
      try {
        await attainmentServices.deleteAttainment(courseId, instanceId, attainmentId);
      } catch (exception) {
        console.log(exception.message);
      }
    } else if (sisuInstanceId) {
      const updatedAttainments = attainmentServices.deleteTemporaryAttainment(
        addedAttainments, attainments[0]
      );

      setAddedAttainments(updatedAttainments);
    }
    navigate(-1);
  }

  function handleSubmit(event): void {
    event.preventDefault();
    try {
      // If this view is opened from the course view, update DB
      // Else the attainment is being edited during the creation of an
      // instance so only update the context
      if (instanceId) {
        const updatedAttainments = attainmentServices.formatStringsToDates(attainments);
        const existingAttainments = attainmentServices.getExistingAttainments(updatedAttainments);
        const newAttainments = attainmentServices.getNewAttainments(updatedAttainments);
        existingAttainments.forEach((attainment) => editAttainment(attainment));
        newAttainments.forEach((attainment) => addAttainment(attainment));
        deletedAttainments.forEach((attainment) => {
          if (attainment.id)
            deleteAttainment(attainment.id);
        });
        navigate(-1);
      } else if (sisuInstanceId) {
        const updatedAttainments = attainmentServices.updateTemporaryAttainment(
          addedAttainments, attainments[0]
        );

        setAddedAttainments(updatedAttainments);
        navigate(-1);
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  // Functions and varibales for opening and closing the dialog for confirming attainment deletion
  const [openConfDialog, setOpenConfDialog] = useState(false);

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
      const deletedAttainment = attainmentServices.getAttainmentByIndices(indices, attainments);
      const updatedAttainments = attainmentServices.removeAttainment(indices, attainments);
      setDeletedAttainments([...deletedAttainments, deletedAttainment]);
      setAttainments(updatedAttainments);
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
            <Attainment
              indices={[0]}
              attainments={attainments}
              setAttainments={setAttainments}
              removeAttainment={removeAttainment}
              temporaryId={attainmentIncrementId}
              setIncrementId={setIncrementId}
            />
          </Box>
          <ConfirmationDialog
            title={'Study Attainment'}
            subject={'study attainment'}
            open={openConfDialog}
            handleClose={handleConfDialogClose}
            deleteAttainment={removeAttainment}
            indices={[0]}
            attainments={attainments}
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
