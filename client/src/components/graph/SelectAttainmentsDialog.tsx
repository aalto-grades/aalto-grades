import {AttainmentData} from '@common/types';
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
import {useEffect, useState} from 'react';
import {Node} from 'reactflow';

const SelectAttainmentsDialog = ({
  nodes,
  attainments,
  open,
  onClose,
  handleAttainmentSelect,
}: {
  nodes: Node[];
  attainments: AttainmentData[];
  open: boolean;
  onClose: () => void;
  handleAttainmentSelect: (
    newAttainments: AttainmentData[],
    removedAttainments: AttainmentData[]
  ) => void;
}) => {
  const attainmentNodeIds: number[] = nodes
    .filter(node => node.type === 'attainment')
    .map(node => parseInt(node.id.split('-')[1]));

  const initSelected: {[key: number]: boolean} = {};
  for (const attainment of attainments) initSelected[attainment.id] = false;
  const [startSelected, setStartSelected] = useState<{[key: number]: boolean}>(
    initSelected
  );
  const [selected, setSelected] = useState<{[key: number]: boolean}>(
    initSelected
  );

  useEffect(() => {
    if (!open) return;
    const newSelected: {[key: number]: boolean} = {};
    for (const attainment of attainments) {
      newSelected[attainment.id] = attainmentNodeIds.includes(attainment.id);
    }
    if (JSON.stringify(newSelected) === JSON.stringify(startSelected)) return;

    setSelected(newSelected);
    setStartSelected(newSelected);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSelect = (id: number) => {
    setSelected(oldSelected => ({
      ...oldSelected,
      [id]: !oldSelected[id],
    }));
  };

  const onSubmit = () => {
    const newAttainments: AttainmentData[] = [];
    const removedAttainments: AttainmentData[] = [];
    for (const [stringKey, value] of Object.entries(selected)) {
      const key = parseInt(stringKey);
      if (value && !startSelected[key])
        newAttainments.push(
          attainments.find(att => att.id === key) as AttainmentData
        );
      if (!value && startSelected[key])
        removedAttainments.push(
          attainments.find(att => att.id === key) as AttainmentData
        );
    }
    handleAttainmentSelect(newAttainments, removedAttainments);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Select Attainments</DialogTitle>

      <DialogContent>
        <FormGroup>
          {attainments.map(attainment => (
            <FormControlLabel
              key={attainment.id}
              control={
                <Checkbox
                  checked={selected[attainment.id]}
                  onChange={() => onSelect(attainment.id)}
                />
              }
              label={attainment.name}
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

export default SelectAttainmentsDialog;
