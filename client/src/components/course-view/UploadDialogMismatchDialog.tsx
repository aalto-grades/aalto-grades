import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {useEffect, useState} from 'react';

export type MismatchData = {
  fields: string[];
  keys: string[];
  mismatches: string[];
  onImport: (keyMap: {[key: string]: string}) => void;
};

const MismatchDialog = ({
  open,
  onClose,
  mismatchData,
}: {
  open: boolean;
  onClose: () => void;
  mismatchData: MismatchData;
}) => {
  const [selections, setSelections] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<'' | 'empty' | 'duplicate'>('');
  const [duplicate, setDuplicate] = useState<string>('');

  useEffect(() => {
    const newSelections = {...selections};
    for (const key of mismatchData.keys) {
      if (mismatchData.mismatches.includes(key)) continue;
      newSelections[key] = mismatchData.fields.find(
        field => field.toLowerCase() === key.toLowerCase()
      ) as string;
    }
    setSelections(newSelections);
  }, [mismatchData.fields, mismatchData.keys, mismatchData.mismatches]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    for (const key of mismatchData.keys) {
      if (!(key in selections)) {
        setError('empty');
        return;
      }
    }
    const usedSelections: string[] = [];
    for (const value of Object.values(selections)) {
      if (usedSelections.includes(value) && value !== 'Ignore Column') {
        setError('duplicate');
        setDuplicate(value);
        return;
      }
      usedSelections.push(value);
    }
    setError('');
  }, [mismatchData.keys, selections]);

  return (
    <Dialog open={open && mismatchData !== null} fullWidth onClose={onClose}>
      <DialogTitle>Mismatching columns found</DialogTitle>
      <DialogContent>
        <Alert severity={error !== '' ? 'error' : 'success'} sx={{mb: 2}}>
          {error === ''
            ? 'All Done!'
            : error === 'empty'
            ? '"Import as" field cannot be empty'
            : 'The same import as value cannot appear twice'}
        </Alert>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>CSV column</TableCell>
                <TableCell>Import as</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mismatchData.keys.map(key => (
                <TableRow key={`mismatch-${key}`}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <FormControl
                      error={
                        (error === 'empty' && selections[key] === undefined) ||
                        (error === 'duplicate' && selections[key] === duplicate)
                      }
                    >
                      <InputLabel id={`mismatch-select${key}`}>
                        Import as
                      </InputLabel>
                      <Select
                        labelId={`mismatch-select${key}`}
                        label="Import as"
                        size="small"
                        value={selections[key] ?? ''}
                        onChange={e =>
                          setSelections(oldSelections => ({
                            ...oldSelections,
                            [key]: e.target.value,
                          }))
                        }
                        sx={{minWidth: 200}}
                      >
                        {mismatchData.fields.map((field, index) => (
                          <MenuItem
                            key={`mismatch-${key}-select-${field}`}
                            value={field}
                            divider={
                              index === 0 ||
                              index === mismatchData.fields.length - 1
                            }
                          >
                            {field}
                          </MenuItem>
                        ))}
                        <MenuItem key="Ignore Column" value="Ignore Column">
                          Ignore Column
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => mismatchData.onImport(selections)}
          disabled={error !== ''}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MismatchDialog;
