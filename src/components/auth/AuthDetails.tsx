import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthDetails: React.FC = () => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {authUser ? (
        <>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Connecté en tant que {authUser.email}
          </Typography>
          <Button variant="outlined" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </>
      ) : (
        <Typography variant="body1">
          Déconnecté
        </Typography>
      )}
    </Box>
  );
};

export default AuthDetails;
