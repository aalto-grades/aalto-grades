// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import Dialog from '@/components/shared/Dialog';
import ExternalLink from '@/components/shared/ExternalLink';
import {SERVICE_SOURCE_OPTIONS, type ServiceSourceOption, getServiceToken, setServiceToken} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  serviceInfo?: {id: string; label: string; tokenLink: string};
  error?: boolean;
};

const ServiceTokenDialog = ({
  open,
  onClose,
  onSubmit,
  serviceInfo,
  error = false,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [selectedService, setSelectedService] = useState<ServiceSourceOption>(serviceInfo || SERVICE_SOURCE_OPTIONS[0]);
  const currentToken = getServiceToken(selectedService.id);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [showFullToken, setShowFullToken] = useState<boolean>(false);
  const link = selectedService.tokenLink;

  const isError = error;

  const handleClose = (): void => {
    setTokenInput('');
    onClose();
  };

  const handleSubmit = (): void => {
    if (tokenInput) setServiceToken(selectedService.id, tokenInput);
    setTokenInput('');
    onSubmit();
  };

  const toggleTokenVisibility = (): void => {
    setShowFullToken(prev => !prev);
  };

  const displayToken = showFullToken
    ? currentToken
    : currentToken?.slice(0, 12) + '...';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle>

        <Select
          variant="standard"
          value={selectedService.id}
          onChange={(e) => {
            const selectedOption = SERVICE_SOURCE_OPTIONS.find(option => option.id === e.target.value);
            if (selectedOption) {
              setSelectedService(selectedOption);
            }
          }}
        >
          {SERVICE_SOURCE_OPTIONS.map(option => (
            <MenuItem key={option.id} value={option.id} selected={option.id === selectedService.id}>
              <Typography variant="h6">
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
        {' '}
        {t('shared.auth.token.label')}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {t('shared.auth.token.intro', {service: selectedService.label}) + ': '}
          <ExternalLink href={link}>{link}</ExternalLink>
        </Typography>
        {currentToken && (
          <>
            <Typography>{t('shared.auth.token.current') + ': '}</Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  bgcolor: 'primary.light',
                  alignContent: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {displayToken}
              </Box>
              <Button onClick={toggleTokenVisibility} size="small">
                {showFullToken
                  ? t('shared.auth.token.hide-token-tip')
                  : t('shared.auth.token.show-token-tip')}
              </Button>
            </Box>
          </>
        )}
        <TextField
          autoFocus
          sx={{mt: 2, width: 1}}
          label={t('shared.auth.token.label')}
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          required
          error={isError}
          helperText={isError ? t('shared.auth.token.invalid') : null}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('general.cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {t('general.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceTokenDialog;
