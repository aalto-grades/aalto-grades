// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AttainmentCategory from './attainments/AttainmentCategory';
import attainmentServices from '../services/attainments';

const AddAttainmentsView = () => {
  let navigate = useNavigate();
  let { courseId, sisuInstanceId } = useParams();

  const {
    addedAttainments, setAddedAttainments,
    suggestedAttainments, setSuggestedAttainments,
    attainmentIncrementId, setIncrementId,
  } = useOutletContext<any>();

  useEffect(() => {  // Better if handling here
    if (addedAttainments.length === 0) {
      let allSuggestedAttainments = attainmentServices.getSuggestedAttainments();
      let [updatedAttainments, newTemporaryId] = attainmentServices.addTemporaryIds(allSuggestedAttainments, attainmentIncrementId);
      setIncrementId(newTemporaryId);
      setSuggestedAttainments(updatedAttainments);
    } else {
      // if some attainments have been added, filter the suggestions to make sure there aren't duplicates
      // another possibility is to save the suggestions in context too, will consider if the retrieval is slow
      const nonAdded = suggestedAttainments.filter(suggested => !addedAttainments.some(added => added.temporaryId === suggested.temporaryId));
      setSuggestedAttainments(nonAdded);
    }
  }, []);

  const onAddClick = (attainment) => () => {
    setSuggestedAttainments(
      suggestedAttainments.filter(a => a.temporaryId !== attainment.temporaryId)
    );

    setAddedAttainments(
      attainmentServices.addTemporaryAttainment(addedAttainments, attainment)
    );
  };

  const onRemoveClick = (attainment) => () => {
    setSuggestedAttainments(
      attainmentServices.addTemporaryAttainment(suggestedAttainments, attainment)
    );

    setAddedAttainments(
      addedAttainments.filter(a => a.temporaryId !== attainment.temporaryId)
    );
  };

  const onGoBack = () => {
    navigate('/' + courseId + '/edit-instance/' + sisuInstanceId);
  };

  const onConfirmAttainments = () => {
    navigate('/' + courseId + '/instance-summary/' + sisuInstanceId);
  };

  return (
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <Typography variant='h1' align='left' sx={{ mb: 4 }}>Add Study Attainments</Typography>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }}>Suggested study attainments from previous instances</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'secondary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch' }}>
          {
            suggestedAttainments.map(attainment => {
              /* Since the attainments are displayed by during the creation of an instance,
                 all of them might not exist in the database (since new one can be created)
                 so temporary ids are used as keys for the attainment accoridons */
              return (
                <AttainmentCategory
                  key={attainment.temporaryId}
                  attainment={attainment}
                  attainmentKey={'temporaryId'}
                  buttons={
                    [
                      <Button key='add' onClick={onAddClick(attainment)}>
                        Add
                      </Button>
                    ]
                  }
                />
              );
            })
          }
        </Box>
      </Box>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', mb: 5, mt: 1, display: 'inline-block' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography align='left' sx={{ ml: 1.5 }} >Create and add a new study attainment:</Typography>
          <Button variant='outlined' onClick={ () =>
            navigate(`/${courseId}/create-temporary-attainment/${sisuInstanceId}`) }>
              Create attainment
          </Button>
        </Box>
      </Box>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >Added study attainments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        {
          addedAttainments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            {
              addedAttainments.map(attainment => {
                return (
                  <AttainmentCategory
                    key={attainment.temporaryId}
                    attainment={attainment}
                    attainmentKey={'temporaryId'}
                    buttons={
                      [
                        <Button
                          key='remove'
                          onClick={onRemoveClick(attainment)}
                        >
                          Remove
                        </Button>,
                        <Button
                          key='edit'
                          onClick={() => navigate(`/${courseId}/edit-temporary-attainment/${sisuInstanceId}/${attainment.temporaryId}`)}
                        >
                          Edit
                        </Button>
                      ]
                    }
                  />
                );
              })
            }
          </Box>
        }
        <Typography variant='body1' color='primary.main' sx={{ m: '8px 0px' }} >
          You can also add study attainments after creating the instance
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => onGoBack()}>Go back</Button>
        <Button id='ag_confirm_instance_attainments_btn' variant='contained' onClick={() => onConfirmAttainments()}>Confirm attainments</Button>
      </Box>
    </Box>
  );
};

export default AddAttainmentsView;
