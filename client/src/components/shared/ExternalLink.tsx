// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import LaunchIcon from '@mui/icons-material/Launch';
import type {SxProps, Theme} from '@mui/material';
import Link from '@mui/material/Link';
import type {JSX} from 'react';

type PropsType = {
  href: string;
  linkText: string;
  sx?: SxProps<Theme>;
};

const ExternalLink = ({href, linkText, sx = {}}: PropsType): JSX.Element => {
  return (
    <Link
      rel="noreferrer"
      href={href}
      target="_blank"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        ...sx,
      }}
    >
      {linkText}
      <LaunchIcon fontSize="small" />
    </Link>
  );
};

export default ExternalLink;
