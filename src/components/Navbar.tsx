import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Use RouterLink for navigation

// TODO: Add logic to show/hide links based on auth state
// const isAuthenticated = false; // Placeholder

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            AI Email Assistant
          </RouterLink>
        </Typography>
        
        {/* Placeholder for auth state */}
        {/* {isAuthenticated ? (
          <>
            <Button color="inherit" component={RouterLink} to="/history">
              History
            </Button>
            <Button color="inherit" component={RouterLink} to="/profile"> 
              Profile
            </Button>
            <Button color="inherit" onClick={() => console.log('TODO: Logout')}>
              Logout
            </Button>
          </>
        ) : ( */}
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/signup">
              Sign Up
            </Button>
          </>
        {/* )} */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
