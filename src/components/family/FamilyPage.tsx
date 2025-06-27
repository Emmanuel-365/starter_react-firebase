import React, { useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Typography, Container, Box, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import FamilyList from './FamilyList';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../redux/hooks'; // Custom hooks for typed dispatch and selector
import { fetchUserFamilies, selectUserFamilies, selectFamilyLoading, selectFamilyError, clearFamilyError } from '../../redux/familySlice';

const FamilyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;

  const families = useAppSelector(selectUserFamilies);
  const isLoading = useAppSelector(selectFamilyLoading);
  const error = useAppSelector(selectFamilyError);

  useEffect(() => {
    if (currentUser?.uid) {
      // Clear previous errors when re-fetching or component mounts
      dispatch(clearFamilyError());
      dispatch(fetchUserFamilies(currentUser.uid));
    }
  }, [currentUser, dispatch]);

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mes Familles
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/families/create" // Link to the creation form
          sx={{ mb: 3 }}
        >
          Créer une nouvelle famille
        </Button>
        {families && families.length > 0 ? (
          <FamilyList families={families} />
        ) : (
          !isLoading && !error && <Typography>Vous n'appartenez à aucune famille pour le moment ou aucune famille n'a été trouvée.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default FamilyPage;
