// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Button, Menu, MenuItem} from '@mui/material';
import {type JSX, type MouseEvent, type ReactNode, useState} from 'react';

import type {ServiceSourceOption} from '@/utils/servicesSource';

type Props = {
  buttonLabel: string;
  options: ServiceSourceOption[];
  onSelect: (option: ServiceSourceOption) => void;
  disabled?: boolean;
  startIcon?: ReactNode;
};

const ServiceSourceMenuButton = ({
  buttonLabel,
  options,
  onSelect,
  disabled = false,
  startIcon,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = 'service-source-menu';

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        startIcon={startIcon}
        onClick={handleClick}
        disabled={disabled}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {buttonLabel}
      </Button>
      <Menu id={menuId} anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map(option => (
          <MenuItem
            key={option.id}
            onClick={() => {
              onSelect(option);
              handleClose();
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ServiceSourceMenuButton;
