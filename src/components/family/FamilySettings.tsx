import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { AuthContext } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  updateFamilyDetails,
  deleteFamilyAndMembers,
  fetchFamilyDetails, // To load existing details
  selectCurrentFamily,
  selectFamilyLoading,
  selectFamilyError,
  clearFamilyError,
} from '../../redux/familySlice';
import { Family } from '../../types/Family'; // Ensure Family type is available

const FamilySettings: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;

  const currentFamily = useAppSelector(selectCurrentFamily);
  const isLoading = useAppSelector(selectFamilyLoading);
  const apiError = useAppSelector(selectFamilyError);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(clearFamilyError());
    if (familyId && (!currentFamily || currentFamily.id !== familyId)) {
      dispatch(fetchFamilyDetails(familyId));
    }
  }, [dispatch, familyId, currentFamily]);

  useEffect(() => {
    if (currentFamily && currentFamily.id === familyId) {
      setName(currentFamily.name);
      setDescription(currentFamily.description || '');
    }
  }, [currentFamily, familyId]);


  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    dispatch(clearFamilyError());

    if (!currentUser) {
      setFormError("Authentification requise.");
      return;
    }
    if (!familyId) {
      setFormError("ID de famille manquant.");
      return;
    }
    if (!name.trim()) {
      setFormError("Le nom de la famille ne peut pas être vide.");
      return;
    }

    const dataToUpdate: Partial<Pick<Family, "name" | "description">> = {};
    if (name !== currentFamily?.name) {
      dataToUpdate.name = name;
    }
    if (description !== (currentFamily?.description || '')) {
      dataToUpdate.description = description;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      setFormError("Aucune modification détectée.");
      return;
    }

    dispatch(updateFamilyDetails({ familyId, data: dataToUpdate }))
      .unwrap()
      .then(() => {
        setSuccessMessage("Informations de la famille mises à jour avec succès !");
        setTimeout(() => setSuccessMessage(null), 3000);
        // No navigation needed, stay on settings page. User can go back if they wish.
      })
      .catch((error) => {
        // Error is handled by apiError selector
        console.error("Failed to update family:", error);
      });
  };

  const handleDeleteFamily = () => {
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteConfirm(false);
    if (!familyId) {
      setFormError("ID de famille manquant pour la suppression.");
      return;
    }
    dispatch(clearFamilyError());
    dispatch(deleteFamilyAndMembers(familyId))
      .unwrap()
      .then(() => {
        setSuccessMessage("Famille supprimée avec succès.");
        setTimeout(() => {
          navigate('/families');
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to delete family:", error);
      });
  };

  const currentDisplayError = formError || apiError;

  if (isLoading && !currentFamily) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentFamily && !isLoading && familyId) {
     // This case might happen if fetchFamilyDetails fails or if familyId is invalid.
     // apiError should cover the failure case.
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Alert severity="error">
            {apiError || `Impossible de charger les informations pour la famille ID: ${familyId}.`}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(familyId ? `/families/${familyId}` : '/families')}
            sx={{ mt: 2 }}
          >
            Retour
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!familyId) { // Should ideally not happen if routing is correct
     return <Container><Alert severity="error">Aucun ID de famille fourni.</Alert></Container>
  }


  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4, position: 'relative' }}>
        <IconButton
          onClick={() => navigate(`/families/${familyId}`)}
          sx={{ position: 'absolute', top: 8, left: 8 }}
          aria-label="Retour aux détails de la famille"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
          Paramètres de la Famille
        </Typography>

        <Box component="form" onSubmit={handleUpdateSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="familyName"
            label="Nom de la famille"
            name="familyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            error={!!formError && name.trim() === ''}
            helperText={!!formError && name.trim() === '' ? "Le nom est requis" : ""}
          />
          <TextField
            margin="normal"
            fullWidth
            id="familyDescription"
            label="Description (optionnel)"
            name="familyDescription"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
          {currentDisplayError && <Alert severity="error" sx={{ mt: 2 }}>{currentDisplayError}</Alert>}
          {successMessage && !currentDisplayError && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={isLoading || (name === currentFamily?.name && description === (currentFamily?.description || ''))}
          >
            {isLoading ? <CircularProgress size={24} /> : "Sauvegarder les modifications"}
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Zone de Danger
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleDeleteFamily}
            disabled={isLoading}
          >
            Supprimer cette famille
          </Button>
          <Typography variant="caption" display="block" color="textSecondary" sx={{mt:1}}>
            Cette action est irréversible et supprimera la famille ainsi que tous ses membres.
          </Typography>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmer la suppression"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous absolument sûr de vouloir supprimer la famille "{currentFamily?.name || 'cette famille'}" ?
            Toutes les données associées, y compris les membres, seront définitivement perdues.
          </DialogContentText>
          {apiError && <Alert severity="error" sx={{mt: 2}}>{apiError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit"/> : "Supprimer définitivement"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FamilySettings;
