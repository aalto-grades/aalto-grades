// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
import {type ChangeEvent, type JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {GraphSource, NodeValues, TypedNode} from '@/common/types';

const testFloat = (val: string): boolean => /^\d+(?:\.\d+?)?$/.test(val);

type PropsType = {
  nodes: TypedNode[];
  nodeValues: NodeValues;
  sources: GraphSource[];
  open: boolean;
  onClose: () => void;
  handleSetSourceValues: (sourceValues: {[key: number]: number}) => void;
};
const SourceValuesDialog = ({
  nodes,
  nodeValues,
  sources,
  open,
  onClose,
  handleSetSourceValues,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const sourceNodeIds = useMemo(
    () =>
      nodes
        .filter(node => node.type === 'source')
        .map(node => parseInt(node.id.split('-')[1])),
    [nodes]
  );
  const sourceNames = useMemo(
    () => Object.fromEntries(sources.map(source => [source.id, source.name])),
    [sources]
  );
  const initValues = useMemo(() => {
    const newInitValues: {[key: number]: string} = {};
    for (const [nodeId, nodeValue] of Object.entries(nodeValues)) {
      if (nodeValue.type !== 'source') continue;

      const sourceId = parseInt(nodeId.split('-')[1]);
      if (sourceNodeIds.includes(sourceId))
        newInitValues[sourceId] = nodeValue.source.toString();
    }
    return newInitValues;
  }, [sourceNodeIds, nodeValues]);

  const [values, setValues] = useState<{[key: number]: string}>(initValues);
  const [error, setError] = useState<boolean>(false);

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
    handleSetSourceValues(
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
        {sourceNodeIds.map(sourceId => (
          <TextField
            key={sourceId}
            sx={{mt: 2}}
            value={values[sourceId] ?? 0}
            label={sourceNames[sourceId]}
            onChange={e => onChange(sourceId, e)}
            error={!testFloat(values[sourceId])}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setValues(initValues);
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

export default SourceValuesDialog;
