import React, { useEffect, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert, Container, Paper } from '@mui/material';
import InvitationCard from './InvitationCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchUserPendingInvitations,
  selectUserPendingInvitations,
  selectIsLoadingInvitations,
  selectFamilyError, // Using general family error for now
  clearFamilyError
} from '../../redux/familySlice';
import { AuthContext } from '../../context/AuthContext';

const InvitationsDisplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;

  const pendingInvitations = useAppSelector(selectUserPendingInvitations);
  const isLoading = useAppSelector(selectIsLoadingInvitations);
  const error = useAppSelector(selectFamilyError); // Could be more specific if invitation errors are separated

  useEffect(() => {
    if (currentUser?.email) {
      dispatch(clearFamilyError()); // Clear previous errors
      dispatch(fetchUserPendingInvitations(currentUser.email));
    }
  }, [currentUser, dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des invitations...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>Erreur lors du chargement des invitations: {error}</Alert>;
  }

  if (!pendingInvitations || pendingInvitations.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        Vous n'avez aucune invitation en attente pour le moment.
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 0, mb: 4 }}> {/* Adjusted margin for potential integration */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb:3, mt:2 }}>
            Mes Invitations en Attente ({pendingInvitations.length})
        </Typography>
        {pendingInvitations.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
        ))}
    </Container>
  );
};

export default InvitationsDisplay;
