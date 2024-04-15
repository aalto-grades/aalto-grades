// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useAddAttainment} from '../../hooks/useApi';

type PropsType = {handleClose: () => void; open: boolean};

const AddAttainmentDialog = ({handleClose, open}: PropsType): JSX.Element => {
  const addAttainment = useAddAttainment();
  const [attainment, setAttainment] = useState({name: '', daysValid: 365});
  const {courseId} = useParams() as {courseId: string};

  const handleSave = async (): Promise<void> => {
    await addAttainment.mutateAsync({courseId, attainment});
    setAttainment({name: '', daysValid: 365});
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create new attainment</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          value={attainment.name}
          onChange={e => setAttainment({...attainment, name: e.target.value})}
        />

        <TextField
          sx={{mt: 1}}
          label="Days valid"
          type="number"
          value={attainment.daysValid}
          onChange={e =>
            setAttainment({
              ...attainment,
              daysValid: Number(e.target.value),
            })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAttainmentDialog;
