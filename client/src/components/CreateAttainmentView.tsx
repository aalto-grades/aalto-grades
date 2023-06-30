// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SyntheticEvent, useState }  from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Attainment from './create-attainment/Attainment';
import attainmentServices from '../services/attainments';
import { AttainmentData } from 'aalto-grades-common/types';
import { State } from '../types';

function CreateAttainmentView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, assessmentModelId }: Params = useParams();

  // TODO: We need to know the root attainment's ID and include it in this
  const attainment: AttainmentData = {
    id: -1,
    name: '',
    tag: '',
    daysValid: 0,
    subAttainments: []
  };

  const [attainmentTree, setAttainmentTree]: State<AttainmentData> = useState(attainment);

  const [temporaryId, setTemporaryId]: State<number> = useState(-2);

  function getTemporaryId(): number {
    const id: number = temporaryId;
    setTemporaryId(temporaryId - 1);
    return id;
  }

  function deleteAttainment(attainment: AttainmentData): void {
    function inner(attainment: AttainmentData, tree: AttainmentData) {
      for (const i in tree.subAttainments) {
        const subAttainment: AttainmentData = tree.subAttainments[i];

        if (subAttainment.id === attainment.id) {
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
    try {
      attainmentServices.addAttainment(courseId, assessmentModelId, attainmentTree);
      navigate(-1);
    } catch (exception) {
      console.log(exception);
    }
  }

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: 'right' }}>
        <Typography variant="h1" align='left' sx={{ flexGrow: 1, mb: 4 }}>
          Create Study Attainment
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
            {/* Create the root attainment */}
            <Attainment
              attainmentTree={attainmentTree}
              setAttainmentTree={setAttainmentTree}
              deleteAttainment={deleteAttainment}
              getTemporaryId={getTemporaryId}
              attainment={attainmentTree}
              formulaAttributeNames={[]}
            />
          </Box>
          <Button
            size='medium'
            variant='outlined'
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
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
            Confirm
          </Button>
        </form>
      </Container>
    </>
  );
}

export default CreateAttainmentView;
