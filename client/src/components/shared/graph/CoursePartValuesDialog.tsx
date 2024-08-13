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
import {ChangeEvent, JSX, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Node} from 'reactflow';

import {NodeValues} from '@/common/types/graph';

const testFloat = (val: string): boolean => /^\d+(?:\.\d+?)?$/.test(val);

const CoursePartValuesDialog = ({
  nodes,
  nodeValues,
  courseParts,
  open,
  onClose,
  handleSetCoursePartValues,
}: {
  nodes: Node[];
  nodeValues: NodeValues;
  courseParts: {id: number; name: string}[];
  open: boolean;
  onClose: () => void;
  handleSetCoursePartValues: (coursePartValues: {
    [key: number]: number;
  }) => void;
}): JSX.Element => {
  const {t} = useTranslation();
  const coursePartNodeIds = useMemo(
    () =>
      nodes
        .filter(node => node.type === 'coursepart')
        .map(node => parseInt(node.id.split('-')[1])),
    [nodes]
  );
  const coursePartNames = useMemo(
    () =>
      Object.fromEntries(
        courseParts.map(coursePart => [coursePart.id, coursePart.name])
      ),
    [courseParts]
  );
  const initValues = useMemo(() => {
    const newInitValues: {[key: number]: string} = {};
    for (const [nodeId, nodeValue] of Object.entries(nodeValues)) {
      if (nodeValue.type !== 'coursepart') continue;
      const coursePartId = parseInt(nodeId.split('-')[1]);
      if (coursePartNodeIds.includes(coursePartId))
        newInitValues[coursePartId] = nodeValue.source.toString();
    }
    return newInitValues;
  }, [coursePartNodeIds, nodeValues]);

  const [startValues, setStartValues] = useState<{[key: number]: string}>(
    initValues
  );
  const [values, setValues] = useState<{[key: number]: string}>(initValues);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    if (JSON.stringify(initValues) === JSON.stringify(startValues)) return;

    setError(false);
    setValues(initValues);
    setStartValues(initValues);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (
    id: number,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const badValue = Object.entries(values).find(
      ([valId, val]) => parseInt(valId) !== id && !testFloat(val)
    );
    if (badValue !== undefined || !testFloat(e.target.value)) {
      setError(true);
    } else setError(false);

    setValues(oldSelected => ({
      ...oldSelected,
      [id]: e.target.value,
    }));
  };

  const onSubmit = (): void => {
    handleSetCoursePartValues(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          parseInt(key),
          parseFloat(value),
        ])
      )
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('shared.graph.set-test-values')}</DialogTitle>

      <DialogContent>
        {coursePartNodeIds.map(coursePartId => (
          <TextField
            key={coursePartId}
            sx={{mt: 2}}
            value={values[coursePartId] ?? 0}
            label={coursePartNames[coursePartId]}
            onChange={e => onChange(coursePartId, e)}
            error={!testFloat(values[coursePartId])}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setValues(startValues);
          }}
        >
          {t('general.cancel')}
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={error}>
          {t('general.done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CoursePartValuesDialog;
