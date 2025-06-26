import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import AIEditor from '../components/AIEditor';
import EmailForm from '../components/EmailForm';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          AI-Powered Email Assistant
        </Typography>
        <Stack spacing={4}>
          <AIEditor />
          <EmailForm />
        </Stack>
      </Box>
    </Container>
  );
};

export default HomePage;
