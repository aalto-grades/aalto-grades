// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ClearRounded, SaveOutlined} from '@mui/icons-material';
import {Box, Button, Fade, Typography, useTheme} from '@mui/material';
import {JSX} from 'react';

const SaveBar = ({
  show,
  handleSave,
  handleDiscard,
  loading,
  disabled,
}: {
  show: boolean;
  loading?: boolean;
  disabled?: boolean;
  handleSave?: () => void;
  handleDiscard: () => void;
}): JSX.Element => {
  const theme = useTheme();
  return (
    <Fade in={show}>
      <Box
        sx={{
          background: theme.vars.palette.secondary.light,
          p: 0.5,
          px: 2,
          py: 0.5,
          borderRadius: 3,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          height: '44px',
          boxSizing: 'border-box',
        }}
      >
        {/* // TODO: fix flickering when saving with loading text enabled */}
        {/* {loading ? (
            <Typography variant="body2">Saving...</Typography>
          ) : (
            <Typography variant="body2">Unsaved changes</Typography>
            )}{' '}   */}
        <Typography variant="body2">Unsaved changes</Typography>
        <Button
          id="ag-save-course-btn"
          // variant="outlined"
          type="submit"
          size="small"
          startIcon={<SaveOutlined />}
          disabled={loading || disabled}
          onClick={e => {
            if (handleSave) {
              e.preventDefault();
              handleSave();
            }
          }}
        >
          Save
        </Button>
        <Button
          // variant="tonal"
          size="small"
          disabled={loading || disabled}
          // sx={{float: 'right', mr: 2}}
          color="error"
          onClick={handleDiscard}
          startIcon={<ClearRounded />}
        >
          Discard
        </Button>
      </Box>
    </Fade>
  );
};

export default SaveBar;
