// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import { Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import userService from '../../services/user';
import { Outlet } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isLoggedIn = userService.isLoggedIn();
    
  if (!isLoggedIn) {
    // not logged in so redirect to login page with the return url
    return <Navigate to="/login" />;
  }
  // authorized so return child components
  return (
    <>
      {children}
      <Outlet />
    </>
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.element
};

export default PrivateRoute;
