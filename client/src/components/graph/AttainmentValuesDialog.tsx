import {AttainmentData} from '@common/types';
import {NodeValues} from '@common/types/graph';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {Node} from 'reactflow';

const testFloat = (val: string): boolean => /^\d+(?:\.\d+?)?$/.test(val);

const AttainmentValuesDialog = ({
  nodes,
  nodeValues,
  attainments,
  open,
  onClose,
  handleSetAttainmentValues,
}: {
  nodes: Node[];
  nodeValues: NodeValues;
  attainments: AttainmentData[];
  open: boolean;
  onClose: () => void;
  handleSetAttainmentValues: (attainmentValues: {
    [key: number]: number;
  }) => void;
}) => {
  const attainmentNodeIds = useMemo(
    () =>
      nodes
        .filter(node => node.type === 'attainment')
        .map(node => parseInt(node.id.split('-')[1])),
    [nodes]
  );
  const attainmentNames = useMemo(
    () => Object.fromEntries(attainments.map(att => [att.id, att.name])),
    [attainments]
  );
  const initValues = useMemo(() => {
    const newInitValues: {[key: number]: string} = {};
    for (const [nodeId, nodeValue] of Object.entries(nodeValues)) {
      if (nodeValue.type !== 'attainment') continue;
      const attainmentId = parseInt(nodeId.split('-')[1]);
      if (attainmentNodeIds.includes(attainmentId))
        newInitValues[attainmentId] = nodeValue.source.toString();
    }
    return newInitValues;
  }, [attainmentNodeIds, nodeValues]);

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
  ) => {
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

  const onSubmit = () => {
    handleSetAttainmentValues(
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
      <DialogTitle>Set Test Attainment Values</DialogTitle>

      <DialogContent>
        {attainmentNodeIds.map(attId => (
          <TextField
            sx={{mt: 2}}
            key={`attval-${attId}`}
            value={values[attId] ?? 0}
            label={attainmentNames[attId]}
            onChange={e => onChange(attId, e)}
            error={!testFloat(values[attId])}
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
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={error}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttainmentValuesDialog;
