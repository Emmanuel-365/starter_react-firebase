import React, { useContext } from 'react';
import { Typography, Container, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';
import Chatbot from './chatbot/Chatbot';
import { AuthContext } from '../context/AuthContext'; // Ajout

const Home: React.FC = () => {
  const auth = useContext(AuthContext); // Ajout
  const user = auth?.user;

  return (
    <Container component="main" maxWidth="xl" sx={{ mt: 4, position: 'relative' }}> {/* Changed maxWidth to xl for more space if needed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 3, minHeight: '80vh' }}> {/* Ensure Paper has enough height */}
          <Typography variant="h4" component="h1" gutterBottom>
            Bienvenue sur la page d'accueil !
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ceci est un exemple de page d'accueil pour les utilisateurs authentifiés.
            Vous pouvez ajouter ici le contenu principal de votre application.
            N'hésitez pas à utiliser notre assistant culinaire en bas à droite !
          </Typography>
          
          {/* Integrer le composant ImageUpload ici */}
          <Box sx={{ my: 4 }}>
            <ImageUpload />
          </Box>

          {/* D'autres contenus de la page d'accueil peuvent être ajoutés ici */}

        </Paper>
      </motion.div>

      {/* Passe l'utilisateur au Chatbot */}
      <Chatbot user={user} />
    </Container>
  );
};

export default Home;
