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
import {useRef, useState} from 'react';

type PropsType = {
  handleClose: () => void;
  open: boolean;
  onSave: (name: string, daysValid: number) => void;
};

const AddCoursePartDialog = ({
  handleClose,
  open,
  onSave,
}: PropsType): JSX.Element => {
  const [coursePart, setCoursePart] = useState({name: '', daysValid: 365});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (): void => {
    onSave(coursePart.name, coursePart.daysValid);
    setCoursePart({name: '', daysValid: 365});
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create new course part</DialogTitle>
      <DialogContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          value={coursePart.name}
          onChange={e => setCoursePart({...coursePart, name: e.target.value})}
          required
          error={nameInputRef.current?.validity.valueMissing}
          inputRef={nameInputRef}
        />

        <TextField
          sx={{mt: 1}}
          label="Days valid"
          type="number"
          value={coursePart.daysValid}
          onChange={e =>
            setCoursePart({
              ...coursePart,
              daysValid: Number(e.target.value),
            })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!coursePart.name}
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCoursePartDialog;
