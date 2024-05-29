// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {Node} from 'reactflow';

import {CoursePartData} from '@/common/types';

const SelectCoursePartsDialog = ({
  nodes,
  courseParts,
  open,
  onClose,
  handleCoursePartSelect,
}: {
  nodes: Node[];
  courseParts: {id: number; name: string}[];
  open: boolean;
  onClose: () => void;
  handleCoursePartSelect: (
    newCourseParts: CoursePartData[],
    removedCourseParts: CoursePartData[]
  ) => void;
}): JSX.Element => {
  const coursePartNodeIds: number[] = nodes
    .filter(node => node.type === 'coursepart')
    .map(node => parseInt(node.id.split('-')[1]));

  const initSelected: {[key: number]: boolean} = {};
  for (const coursePart of courseParts) initSelected[coursePart.id] = false;
  const [startSelected, setStartSelected] = useState<{[key: number]: boolean}>(
    initSelected
  );
  const [selected, setSelected] = useState<{[key: number]: boolean}>(
    initSelected
  );

  useEffect(() => {
    if (!open) return;
    const newSelected: {[key: number]: boolean} = {};
    for (const coursePart of courseParts) {
      newSelected[coursePart.id] = coursePartNodeIds.includes(coursePart.id);
    }
    if (JSON.stringify(newSelected) === JSON.stringify(startSelected)) return;

    setSelected(newSelected);
    setStartSelected(newSelected);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSelect = (id: number): void => {
    setSelected(oldSelected => ({
      ...oldSelected,
      [id]: !oldSelected[id],
    }));
  };

  const onSubmit = (): void => {
    const newCourseParts: CoursePartData[] = [];
    const removedCourseParts: CoursePartData[] = [];
    for (const [stringKey, value] of Object.entries(selected)) {
      const key = parseInt(stringKey);
      if (value && !startSelected[key])
        newCourseParts.push(
          courseParts.find(att => att.id === key) as CoursePartData
        );
      if (!value && startSelected[key])
        removedCourseParts.push(
          courseParts.find(att => att.id === key) as CoursePartData
        );
    }
    handleCoursePartSelect(newCourseParts, removedCourseParts);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Select Course Parts</DialogTitle>

      <DialogContent>
        <FormGroup>
          {courseParts.map(coursePart => (
            <FormControlLabel
              key={coursePart.id}
              control={
                <Checkbox
                  checked={selected[coursePart.id]}
                  onChange={() => onSelect(coursePart.id)}
                />
              }
              label={coursePart.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setSelected(startSelected);
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectCoursePartsDialog;
