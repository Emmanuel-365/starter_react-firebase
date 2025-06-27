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
import ProfilePage from './components/profile/ProfilePage'; // Importer la page de profil
// Family Components
import FamilyPage from './components/family/FamilyPage';
import FamilyCreateForm from './components/family/FamilyCreateForm';
import FamilyDetails from './components/family/FamilyDetails';
import FamilySettings from './components/family/FamilySettings';

// FamilyMemberInviteForm is part of FamilyDetails, not a separate route in this setup

// Removed local theme creation, as it's now globally provided from main.tsx via theme.ts

const App: React.FC = () => {
  return (
    <> {/* ThemeProvider is in main.tsx */}
      <CssBaseline /> {/* Apply baseline styling */}
      {/* AuthProvider is already in main.tsx */}
      <Router>
        {/* AuthDetails peut être déplacé dans un layout si besoin d'un affichage plus conditionnel */}
        <AuthDetails /> 
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes using PrivateRoute */}
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Home />} /> 
            <Route path="profile" element={<ProfilePage />} /> {/* Route protégée pour le profil */}
            
            {/* Family Routes */}
            <Route path="families" element={<FamilyPage />} />
            <Route path="families/create" element={<FamilyCreateForm />} />
            <Route path="families/:familyId" element={<FamilyDetails />} />
            <Route path="families/:familyId/settings" element={<FamilySettings />} />
            {/* Note: FamilyMemberInviteForm is integrated as a tab in FamilyDetails, so no separate route needed unless design changes. */}

            {/* Ajoutez d'autres routes protégées ici */}
            {/* Exemple: <Route path="dashboard" element={<Dashboard />} /> */}
          </Route>
          
          {/* Redirect any unknown paths to login or home depending on auth state, or a 404 page */}
          {/* Pour une meilleure expérience, on pourrait rediriger vers "/" 
              et laisser PrivateRoute gérer la redirection vers /login si non authentifié */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;