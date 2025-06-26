import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import AuthDetails from './components/auth/AuthDetails';
import PrivateRoute from './components/auth/PrivateRoute';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider and createTheme
import CssBaseline from '@mui/material/CssBaseline'; // For consistent baseline styling
import Home from './components/Home';

// Create a simple theme (can be customized further in theme.ts if needed)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}> {/* Apply the theme */}
      <CssBaseline /> {/* Apply baseline styling */}
      {/* AuthProvider is already in main.tsx, no need to wrap again here if it's global */}
      {/* If AuthProvider is not global, it should wrap Router */}
      <Router>
        <AuthDetails /> {/* Display auth status and logout button globally or within specific layouts */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute />}>
            {/* Nested routes that require authentication */}
            <Route index element={<Home />} /> {/* Default component for "/" when authenticated */}
            {/* Add other protected routes here, e.g., <Route path="dashboard" element={<Dashboard />} /> */}
          </Route>
          {/* Redirect any unknown paths to login or home depending on auth state, or a 404 page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;