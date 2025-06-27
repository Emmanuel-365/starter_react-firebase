import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createFamilyAndAdmin, selectFamilyLoading, selectFamilyError, clearFamilyError, selectCurrentFamily } from '../../redux/familySlice';

const FamilyCreateForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // Local error for form validation, distinct from Redux store error for API calls
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  const navigate = useNavigate();

  const isLoading = useAppSelector(selectFamilyLoading);
  const apiError = useAppSelector(selectFamilyError); // API error from Redux
  const currentFamily = useAppSelector(selectCurrentFamily); // To get the ID of the newly created family

  useEffect(() => {
    // Clear API errors when component mounts or currentUser changes
    dispatch(clearFamilyError());
  }, [dispatch, currentUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null); // Clear local form error
    dispatch(clearFamilyError()); // Clear previous API error from Redux store
    setSuccessMessage(null);

    if (!currentUser) {
      setFormError("Vous devez être connecté pour créer une famille.");
      return;
    }
    if (!name.trim()) {
      setFormError("Le nom de la famille est requis.");
      return;
    }

    dispatch(createFamilyAndAdmin({ name, createdById: currentUser.uid, description }))
      .unwrap() // Allows to use .then() and .catch() on the dispatched thunk
      .then((resultAction) => {
        // resultAction.payload should be { familyId: string, family: Family }
        const newFamily = resultAction.family; // Access the family object from the payload
        setSuccessMessage(`Famille "${newFamily.name}" créée avec succès !`);
        setName('');
        setDescription('');
        setTimeout(() => {
          navigate(`/families/${newFamily.id}`);
        }, 1500);
      })
      .catch((errorPayload) => {
        // errorPayload is the string from rejectWithValue
        // No need to setFormError here as apiError from Redux store will be updated and displayed
        console.error("Failed to create family:", errorPayload);
      });
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
            disabled={isLoading}
            error={!!formError && name.trim() === ''} // Highlight if this field is the source of formError
            helperText={formError && name.trim() === '' ? formError : ''}
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
            disabled={isLoading}
          />
          {/* Display API error from Redux store */}
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          {/* Display local form error (e.g., not connected) */}
          {formError && !apiError && <Alert severity="warning" sx={{ mt: 2 }}>{formError}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Créer la famille"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FamilyCreateForm;
