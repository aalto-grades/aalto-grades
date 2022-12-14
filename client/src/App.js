// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import CourseView from './components/CourseView';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import styled from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#EFF3FB',
      main: '#3d5afe',
      dark: '#0031ca',
      contrastText: '#fff',
    },
    secondary: {
      light: '#f1f8f0',
      main: '#96cf99',
      dark: '#519657',
      contrastText: '#000',
    },
    info: {
      light: '#ffc046',
      main: '#ff8f00',
      dark: '#c56000',
      contrastText: '#000',
    },
    contrastThreshold: 4.5
  },
});

const AppContainer = styled(Container)`
  text-align: center;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Link 
            href="/" 
            underline="none" 
            color="white" 
            variant="h5" 
            align="left"
            sx={{ mr: 2 }}
          >
          Aalto Grades
          </Link>
        </Toolbar>
      </AppBar>
      <AppContainer maxWidth="lg">
        <Box mx={5} my={5}>
          <Routes>
            <Route path='/' element={<FrontPage/>} />
            <Route path='/course-view/:courseCode' element={<CourseView/>}/>  {/* Add nested routes when needed */}
          </Routes>
        </Box>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
