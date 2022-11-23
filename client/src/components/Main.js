// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Button from '@mui/material/Button';

const Main = () => {
  return (
    <div>
      <h1>This is the base for frontend development</h1>
      <Button color="primary" sx={{ mr: 1 }}>Primary button</Button>
      <Button variant="outlined" color="secondary">Outlined secondary button</Button>
    </div>
  );
};

export default Main;