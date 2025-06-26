import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import theme from './theme'; // Import the custom theme
import './App.css'; // Keep App.css for any global non-MUI styles or overrides

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HistoryPage from './pages/HistoryPage';
// import ProtectedRoute from './components/ProtectedRoute'; // Will be created later for auth

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* 
            Example of a protected route, will be implemented later
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } 
            /> 
          */}
          <Route path="/history" element={<HistoryPage />} /> {/* Placeholder for now */}
          
          {/* TODO: Add a 404 Not Found page */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
