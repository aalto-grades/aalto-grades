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
import {type JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import Dialog from '@/components/shared/Dialog';
import ExternalLink from '@/components/shared/ExternalLink';
import {useGetClientEnvVariables} from '@/hooks/api/meta';
import {
  getServiceToken,
  setServiceToken,
} from '@/utils';

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
  const {data: clientEnv} = useGetClientEnvVariables();
  const services = clientEnv?.EXTERNAL_SERVICES || [];

  const [selectedService, setSelectedService] = useState(
    serviceInfo || services[0] || {id: '', label: '', tokenLink: ''}
  );
  const currentToken = getServiceToken(selectedService.id);
  const [tokenInput, setTokenInput] = useState('');
  const [showFullToken, setShowFullToken] = useState(false);
  const link = selectedService.tokenLink;

  const isError = error;
  useEffect(() => {
    if (open && serviceInfo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedService(serviceInfo);
    }
  }, [open, serviceInfo]);

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
            const selectedOption = services.find(option => option.id === e.target.value);
            if (selectedOption) {
              setSelectedService(selectedOption);
            }
          }}
        >
          {services.map(option => (
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
        {selectedService.id === 'mycourses' && (
          <>

            {'First register Ossi to receive the token from MyCourses, use this button: '}
            <Button
              variant="outlined"
              disabled={!clientEnv}
              onClick={() => {
                if (navigator.registerProtocolHandler && clientEnv) {
                  console.log(
                    `Registering protocol handler for ${clientEnv.PROTOCOL_HANDLER_NAME} with callback ${clientEnv.PROTOCOL_HANDLER_URL}`
                  );
                  try {
                    navigator.registerProtocolHandler(
                      clientEnv.PROTOCOL_HANDLER_NAME,
                      clientEnv.PROTOCOL_HANDLER_URL
                    );
                  } catch (err) {
                    console.error('Could not register protocol handler', err);
                  }
                } else {
                  console.warn(
                    'Protocol handler registration not supported in this browser or environment variables not loaded'
                  );
                }
              }}
            >
              Register Handler
            </Button>
            <Typography sx={{mt: 2}}>
              {`Logout from MyCourses before opening the link `}
            </Typography>
          </>
        )}
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
