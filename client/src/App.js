// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Info from './components/Info';
import Login from './components/Login';
import Signup from './components/Signup'
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';

const AppContainer = styled(Container)`
  text-align: center;
`;

function App() {
  return (
    <AppContainer maxWidth="false" disableGutters="true">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="div" align="left" sx={{ flexGrow: 1 }}>
          Hello world!
          </Typography>
          <Link href="/" underline="none" color="white" sx={{ mr: 2 }}>To Main</Link>
          <Link href="/info" underline="none" color="white" sx={{ mr: 2 }}>To Info</Link>
          <Link href="/login" underline="none" color="white" sx={{ mr: 2 }}>To Login</Link>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path='/info' element={<Info/>} />
        <Route path='/' element={<Main/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
      </Routes>
    </AppContainer>
  );
}

export default App;
