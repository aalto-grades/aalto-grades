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
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {Node} from 'reactflow';

import type {CoursePartData} from '@/common/types';

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
  const {t} = useTranslation();
  const coursePartNodeIds = new Set(
    nodes
      .filter(node => node.type === 'coursepart')
      .map(node => parseInt(node.id.split('-')[1]))
  );
  const startSelected = Object.fromEntries(
    courseParts.map(({id}) => [id, coursePartNodeIds.has(id)])
  );

  const [selected, setSelected] = useState<{[key: number]: boolean}>(
    startSelected
  );

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
          courseParts.find(
            coursePart => coursePart.id === key
          ) as CoursePartData
        );
      if (!value && startSelected[key])
        removedCourseParts.push(
          courseParts.find(
            coursePart => coursePart.id === key
          ) as CoursePartData
        );
    }
    handleCoursePartSelect(newCourseParts, removedCourseParts);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('general.select-course-parts')}</DialogTitle>

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
          {t('general.cancel')}
        </Button>
        <Button variant="contained" onClick={onSubmit}>
          {t('general.done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectCoursePartsDialog;
