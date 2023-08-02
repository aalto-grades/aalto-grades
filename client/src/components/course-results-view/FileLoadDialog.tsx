// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormHelperText, Typography
} from '@mui/material';
import { ChangeEvent, createRef, RefObject, useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from '../alerts/AlertSnackbar';
import FileErrorDialog from './FileErrorDialog';

import { useUploadGradeCsv, UseUploadGradeCsvResult } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { State } from '../../types';

const instructions: string =
  'Upload a CSV file with the header "studentNo" and headers matching to the'
  + ' study attainment tags you wish to add grades for. You can see an example'
  + ' of a CSV file of the correct format below.';

const exampleText: string =
  'A student with the student number 222222 has gotten 8 points from the'
  + ' attainment \'C3I9A1\' and 7 points from attainment \'C3I9A2\'.';

const errorInstructions: string =
  'The input file cannot be processed due to the following issues that must be'
  + ' addressed and fixed:';

// How many errors are initially rendered visible in the dialog.
export const maxErrorsToShow: number = 5;

// A Dialog component for uploading a file
export default function FileLoadDialog(props: {
  assessmentModelId: number,
  handleClose: () => void,
  open: boolean
}): JSX.Element {
  const { courseId }: Params = useParams();
  const fileInput: RefObject<HTMLInputElement> = createRef();

  // state variables handling the alert messages
  const snackPack: SnackPackAlertState = useSnackPackAlerts();
  const [showErrorDialog, setShowErrorDialog]: State<boolean> = useState(false);

  function toggleErrorDialog(): void {
    setShowErrorDialog(!showErrorDialog);
  }

  const [fileName, setFileName]: State<string | null> = useState<string | null>(null);
  const [validationError, setValidationError]: State<string> = useState<string>('');
  const [fileErrors, setFileErrors]: State<Array<string>> = useState<Array<string>>([]);

  const uploadGradeCsv: UseUploadGradeCsvResult = useUploadGradeCsv({
    onSuccess: () => {
      snackPack.push({
        msg: 'File processed successfully, grades imported.'
          + ' To refresh final grades, press "calculate final grades"',
        severity: 'success'
      });
      props.handleClose();
      setFileName(null);
    }
  });

  async function uploadFile(): Promise<void> {
    if (courseId && fileInput.current?.files) {
      snackPack.push({
        msg: 'Importing grades...',
        severity: 'info'
      });

      uploadGradeCsv.mutate({
        courseId: courseId,
        assessmentModelId: props.assessmentModelId,
        csv: fileInput.current.files[0]
      });
    }
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >Add Grades from File</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText sx={{ mb: 3, color: 'black' }}>
            {instructions}
          </DialogContentText>
          <Box sx={{
            display: 'flex', justifyContent: 'flex-start',
            alignItems: 'center', columnGap: 2, mb: 3
          }}>
            <Typography variant='body2' sx={{ color: 'infoGrey' }}>
              {exampleText}
            </Typography>
            <Box
              component="img"
              sx={{
                height: 90,
                width: 283,
                boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
              }}
              alt={'A picture of a sheet with three columns. First one is student '
                + 'numbers (StudentNo), the next is points from attainment C3I9A1 '
                + 'and the third column is points from attainment C3I9A2.'}
              src="/Import-grades-file-example.jpg"
            />
          </Box>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
            alignItems: 'center', columnGap: 2
          }}>
            <Button id='ag_select_file_btn' component='label'>
              Upload file
              <input
                hidden
                name='file_input'
                ref={fileInput}
                type='file'
                accept='.csv'
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  event.preventDefault();
                  if (event.target.value) { // new input -> clear errors
                    setValidationError('');
                    setFileErrors([]);
                  }
                  if (fileInput.current?.files) {
                    setFileName(fileInput.current?.files[0].name);
                  }
                }}
              />  {/* accept multiple?? */}
            </Button>
            <Typography>{fileName ?? 'Select a file'}</Typography>
          </Box>
          {validationError && <FormHelperText error={true}>{validationError}</FormHelperText>}
          {fileErrors.length !== 0 && (
            <>
              <Typography id={'file_content_errors'} sx={{ mt: 2 }}>{errorInstructions}</Typography>
              {fileErrors.length > maxErrorsToShow ? (
                <>
                  <ul>
                    {
                      fileErrors.slice(0, maxErrorsToShow).map((err: string) => {
                        return (
                          <li key={err}>
                            <FormHelperText error={true}>{err}</FormHelperText>
                          </li>
                        );
                      })
                    }
                  </ul>
                  <Typography id='multiple_errors' sx={{ mt: 2 }}>
                    {`And ${fileErrors.length - maxErrorsToShow} more errors found.`}
                    <Button onClick={toggleErrorDialog}>Show all</Button>
                  </Typography>
                </>
              ) : (
                <ul>
                  {
                    fileErrors.map((err: string) => {
                      return (
                        <li key={err}>
                          <FormHelperText error={true}>
                            {err}
                          </FormHelperText>
                        </li>
                      );
                    })
                  }
                </ul>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button size='medium' onClick={(): void => {
            props.handleClose();
            setFileName(null);
            setValidationError('');
            setFileErrors([]);
          }}>
            Cancel
          </Button>
          <Button
            id='ag_confirm_file_upload_btn'
            size='medium'
            variant='outlined'
            onClick={(): void => {
              if (!fileName) {
                setValidationError('You must select a CSV file to submit');
                return;
              }
              uploadFile();
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar snackPack={snackPack} />
      <FileErrorDialog
        handleClose={toggleErrorDialog}
        open={showErrorDialog}
        errors={fileErrors}
      />
    </>
  );
}
