import React from 'react';
import { Typography, Container, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Bienvenue sur la page d'accueil !
          </Typography>
        <Typography variant="body1">
          Ceci est un exemple de page d'accueil pour les utilisateurs authentifiés.
          Vous pouvez ajouter ici le contenu principal de votre application.
        </Typography>
        <Box sx={{ mt: 2 }}>
          {/* Vous pouvez ajouter d'autres composants ou informations ici */}
        </Box>
      </Paper>
      </motion.div>
    </Container>
  );
};

export default Home;
