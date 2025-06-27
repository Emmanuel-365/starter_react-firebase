import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { createFamily } from '../../services/familyService';

const FamilyCreateForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUser) {
      setError("Vous devez être connecté pour créer une famille.");
      return;
    }
    if (!name.trim()) {
      setError("Le nom de la famille est requis.");
      return;
    }

    setLoading(true);
    try {
      const familyId = await createFamily(name, currentUser.uid, description);
      setSuccess(`Famille "${name}" créée avec succès ! ID: ${familyId}`);
      setName('');
      setDescription('');
      // Navigate to the new family's page or back to the list after a short delay
      setTimeout(() => {
        navigate(`/families/${familyId}`); // Or navigate('/families')
      }, 2000);
    } catch (err) {
      console.error("Error creating family:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la famille.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Créer une Nouvelle Famille
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="familyName"
            label="Nom de la famille"
            name="familyName"
            autoComplete="family-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            id="familyDescription"
            label="Description (optionnel)"
            name="familyDescription"
            autoComplete="family-description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Créer la famille"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FamilyCreateForm;
