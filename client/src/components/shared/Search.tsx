// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {IconButton, InputAdornment, OutlinedInput} from '@mui/material';
import type {OutlinedInputProps} from '@mui/material/OutlinedInput';
import type {ChangeEvent, JSX} from 'react';
import {useTranslation} from 'react-i18next';

type PropsType = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  reset: () => void;
} & OutlinedInputProps;

const Search = ({value, onChange, reset, ...props}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  return (
    <OutlinedInput
      size="small"
      placeholder={t('general.search')}
      value={value}
      onChange={onChange}
      startAdornment={(
        <InputAdornment position="start" sx={{color: 'text.primary'}}>
          <SearchRoundedIcon fontSize="small" />
        </InputAdornment>
      )}
      endAdornment={
        value.length > 0 && (
          <IconButton
            sx={{border: 'none', backgroundColor: 'transparent'}}
            aria-label="reset-search"
            size="small"
            onClick={() => reset()}
          >
            <CloseIcon />
          </IconButton>
        )
      }
      {...props}
    />
  );
};

export default Search;
