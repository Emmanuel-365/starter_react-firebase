import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { FamilyMemberWithFamilyDetails } from '../../types/FamilyMember';
import { useAppDispatch } from '../../redux/hooks';
import { acceptInvitationThunk, declineInvitationThunk } from '../../redux/familySlice';

interface InvitationCardProps {
  invitation: FamilyMemberWithFamilyDetails;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invitation }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(acceptInvitationThunk({ familyMemberId: invitation.id })).unwrap();
      // The list will be updated by Redux state change removing this invitation
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'acceptation de l'invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(declineInvitationThunk({ familyMemberId: invitation.id })).unwrap();
      // The list will be updated by Redux state change removing this invitation
    } catch (err: any) {
      setError(err.message || "Erreur lors du refus de l'invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Invitation à rejoindre la famille : {invitation.familyName}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Vous avez été invité(e) à rejoindre la famille "{invitation.familyName}" en tant que {invitation.role}.
          {invitation.invitedByUserId && (
            <Typography variant="caption" display="block" sx={{mt: 0.5}}>
              (Invitation envoyée par l'utilisateur avec ID: {invitation.invitedByUserId.substring(0,6)}...)
            </Typography>
          )}
           {invitation.invitedEmail && (
            <Typography variant="caption" display="block">
              Votre email invité: {invitation.invitedEmail}
            </Typography>
          )}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDecline}
            disabled={isLoading}
            sx={{ mr: 1 }}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Refuser'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Accepter'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvitationCard;
