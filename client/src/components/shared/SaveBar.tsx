// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ClearRounded, SaveOutlined} from '@mui/icons-material';
import {Box, Button, Fade, Typography, useTheme} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

type PropsType = {
  show: boolean;
  handleSave?: () => void;
  handleDiscard: () => void;
  loading?: boolean;
  disabled?: boolean;
};
const SaveBar = ({
  show,
  handleSave,
  handleDiscard,
  loading = false,
  disabled,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Fade in={show}>
      <Box
        sx={{
          background: theme.palette.secondary.light,
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
        <Typography variant="body2">{t('general.unsaved-changes')}</Typography>
        <Button
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
          {t('general.save')}
        </Button>
        <Button
          size="small"
          disabled={loading || disabled}
          color="error"
          onClick={handleDiscard}
          startIcon={<ClearRounded />}
        >
          {t('general.discard')}
        </Button>
      </Box>
    </Fade>
  );
};

export default SaveBar;
