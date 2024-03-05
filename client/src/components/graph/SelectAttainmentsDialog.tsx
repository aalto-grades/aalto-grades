import {AttainmentData} from '@common/types';
import {Close} from '@mui/icons-material';
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
} from '@mui/material';
import {useEffect, useState} from 'react';
import {Node} from 'reactflow';

const SelectAttainmentsDialog = ({
  nodes,
  attainments,
  open,
  onClose: parentOnClose,
}: {
  nodes: Node[];
  attainments: AttainmentData[];
  open: boolean;
  onClose: (
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
    setSelected(newSelected);
    setStartSelected(newSelected);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSelect = (id: number) => {
    setSelected(oldSelected => ({
      ...oldSelected,
      [id]: !oldSelected[id],
    }));
  };

  const onClose = () => {
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
    parentOnClose(newAttainments, removedAttainments);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Attainments</DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent sx={{minWidth: 250, pt: 0}}>
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
    </Dialog>
  );
};

export default SelectAttainmentsDialog;
