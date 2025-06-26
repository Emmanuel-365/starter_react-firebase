import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import AuthDetails from './components/auth/AuthDetails';
import PrivateRoute from './components/auth/PrivateRoute';
// ThemeProvider is now in main.tsx, CssBaseline can be added there or here.
// For simplicity, keeping CssBaseline here for now.
import CssBaseline from '@mui/material/CssBaseline'; 
import Home from './components/Home';
// Removed local theme creation, as it's now globally provided from main.tsx via theme.ts

const App: React.FC = () => {
  return (
    <> {/* ThemeProvider is in main.tsx */}
      <CssBaseline /> {/* Apply baseline styling */}
      {/* AuthProvider is already in main.tsx */}
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
    </>
  );
};

export default App;