// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Box from '@mui/material/Box';
import styled, { StyledComponent } from 'styled-components';

const StyledBox: StyledComponent<typeof Box, object> = styled(Box)`
  width: 53vw;
  min-width:  400px;
  max-width: 1000px;
`;

export default StyledBox;
