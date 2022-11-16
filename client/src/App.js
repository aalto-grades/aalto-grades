import { Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import CourseView from './components/CourseView';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import styled from 'styled-components'

const AppContainer = styled(Container)`
  text-align: center;
`

function App() {
  return (
    <AppContainer maxWidth="false" disableGutters={true}>
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
    <Routes>
      <Route path='/' element={<FrontPage/>} />
      <Route path='/course-view/:courseCode' element={<CourseView/>}/>  {/* Add nested routes when needed */}
    </Routes>
    </AppContainer>
  );
}

export default App;
