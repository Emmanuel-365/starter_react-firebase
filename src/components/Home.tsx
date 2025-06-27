import React, { useContext } from 'react';
import { Typography, Container, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';
import Chatbot from './chatbot/Chatbot';
import { AuthContext } from '../context/AuthContext';
import InvitationsDisplay from './invitations/InvitationsDisplay'; // Import the InvitationsDisplay component

const Home: React.FC = () => {
  const authContext = useContext(AuthContext);
  // Use authContext.currentUser which is the Firebase User object, or adapt Chatbot if it expects a different 'user' shape
  const firebaseUser = authContext?.currentUser;

  return (
    <Container component="main" maxWidth="xl" sx={{ mt: 4, position: 'relative' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}> {/* Added mb for spacing */}
          <Typography variant="h4" component="h1" gutterBottom>
            Bienvenue sur la page d'accueil !
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ceci est un exemple de page d'accueil pour les utilisateurs authentifiés.
            Vous pouvez ajouter ici le contenu principal de votre application.
            N'hésitez pas à utiliser notre assistant culinaire en bas à droite !
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <ImageUpload />
          </Box>
        </Paper>

        {/* Display Pending Invitations */}
        {/* The InvitationsDisplay component handles fetching and displaying invitations if the user is logged in. */}
        <Box sx={{ mb: 4 }}>
          <InvitationsDisplay />
        </Box>

        {/* D'autres contenus de la page d'accueil peuvent être ajoutés ici */}

      </motion.div>

      {/*
        Adjust the user prop for Chatbot.
        If Chatbot expects a Firebase User object, firebaseUser is correct.
        If it expects a different structure, you might need to adapt.
        For now, assuming Chatbot can handle the Firebase User object or is adapted.
      */}
      <Chatbot user={firebaseUser} />
    </Container>
  );
};

export default Home;
