// SPDX-FileCopyrightText: 2024 The Ossi Developers
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

import type {GraphSource, TypedNode} from '@/common/types';

type PropsType = {
  nodes: TypedNode[];
  sources: GraphSource[];
  open: boolean;
  onClose: () => void;
  handleSourceSelect: (
    newSources: GraphSource[],
    removedSources: GraphSource[]
  ) => void;
};
const SelectSourcesDialog = ({
  nodes,
  sources,
  open,
  onClose,
  handleSourceSelect,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const sourceNodeIds = new Set(
    nodes
      .filter(node => node.type === 'source')
      .map(node => parseInt(node.id.split('-')[1]))
  );
  const startSelected = Object.fromEntries(
    sources.map(({id}) => [id, sourceNodeIds.has(id)])
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
    const newSources: GraphSource[] = [];
    const removedSources: GraphSource[] = [];
    for (const [stringKey, value] of Object.entries(selected)) {
      const key = parseInt(stringKey);
      if (value && !startSelected[key])
        newSources.push(sources.find(source => source.id === key)!);
      if (!value && startSelected[key])
        removedSources.push(sources.find(source => source.id === key)!);
    }
    handleSourceSelect(newSources, removedSources);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('shared.graph.select-sources')}</DialogTitle>
      <DialogContent>
        <FormGroup>
          {sources
            .filter(source => !source.archived)
            .map(source => (
              <FormControlLabel
                key={source.id}
                control={
                  <Checkbox
                    checked={selected[source.id]}
                    onChange={() => onSelect(source.id)}
                  />
                }
                label={source.name}
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

export default SelectSourcesDialog;
