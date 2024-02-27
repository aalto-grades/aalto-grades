// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData} from '@common/types';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import {JSX} from 'react';
import {useParams} from 'react-router-dom';

import {Form, Formik} from 'formik';
import {
  useEditAssessmentModel,
  useGetAssessmentModel,
} from '../../hooks/useApi';

type FormValues = {
  name: string;
};

export default function ModifyAssessmentModelDialog(props: {
  handleClose: () => void;
  open: boolean;
  onSubmit: () => void;
  assessmentModels?: Array<AssessmentModelData>;
  modelId: number;
}): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const assessmentModel = useGetAssessmentModel(courseId, props.modelId);
  const updateAssessmentModel = useEditAssessmentModel();

  async function handleSubmit(values: FormValues): Promise<void> {
    if (courseId && props.modelId) {
      updateAssessmentModel.mutate(
        {
          courseId: courseId,
          assessmentModelId: props.modelId,
          assessmentModel: {
            name: values.name,
          },
        },
        {
          onSuccess: () => {
            props.handleClose();
            props.onSubmit();
          },
        }
      );
    }
  }

  return (
    <Dialog open={props.open} transitionDuration={{exit: 800}}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <DialogTitle>Modify Assessment Model</DialogTitle>
        <DialogContent>
          {assessmentModel.data?.name && (
            <Formik
              initialValues={{name: assessmentModel.data?.name}}
              onSubmit={handleSubmit}
            >
              {({values, handleChange}) => (
                <Form>
                  <TextField
                    key="name"
                    id="name"
                    type="text"
                    label="Name*"
                    fullWidth
                    InputLabelProps={{shrink: true}}
                    margin="normal"
                    value={values.name}
                    onChange={handleChange}
                  />
                  <Stack spacing={2} direction="row" sx={{mt: 2}}>
                    <Button
                      size="large"
                      variant="outlined"
                      onClick={props.handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="large"
                      variant="contained"
                      type="submit"
                      disabled={values.name.length === 0}
                    >
                      Save
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
          {/* <Typography variant="body2" sx={{mt: 2}}>
            Danger Zone
          </Typography>
          <Button>Delete Assessment Model</Button> */}
        </DialogContent>
      </Box>
    </Dialog>
  );
}
