import React, { useState, useContext } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addNewFamilyMember, selectFamilyLoading, selectFamilyError, clearFamilyError } from '../../redux/familySlice';
import { FamilyMemberRole, MemberProfileInfo } from '../../types/FamilyMember'; // Ensure MemberProfileInfo is exported or defined

interface FamilyMemberInviteFormProps {
  familyId: string;
  onMemberInvited: () => void; // Callback to refresh member list or parent component
}

const FamilyMemberInviteForm: React.FC<FamilyMemberInviteFormProps> = ({ familyId, onMemberInvited }) => {
  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [invitedEmail, setInvitedEmail] = useState(''); // For inviting existing users by email
  const [role, setRole] = useState<FamilyMemberRole>(FamilyMemberRole.MEMBER);

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoading = useAppSelector(selectFamilyLoading);
  const apiError = useAppSelector(selectFamilyError);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    dispatch(clearFamilyError());

    if (!currentUser) {
      setFormError("L'utilisateur actuel n'est pas authentifié.");
      return;
    }
    if (!firstName.trim()) {
      setFormError("Le prénom du membre est requis.");
      return;
    }
    if (!relationship.trim()) {
      setFormError("La relation du membre est requise (ex: Mère, Fils, Ami).");
      return;
    }
    // Basic email validation (optional, can be more robust)
    if (invitedEmail && !invitedEmail.includes('@')) {
        setFormError("L'adresse e-mail d'invitation n'est pas valide.");
        return;
    }

    const profileInfo: MemberProfileInfo = {
      firstName,
      lastName: lastName.trim() || undefined, // Optional
      relationship,
      // Add other fields like allergies, preferences if your form collects them
    };

    // Construct memberData carefully based on whether it's an email invite or direct add
    // The `userId` field would be for linking to an *existing, known* user account ID directly,
    // which is different from inviting by email where the system resolves the email to a user.
    // For this form, `invitedEmail` is primary for new user invites.
    // If `addFamilyMember` service can find user by email and link, then `userId` might be set by backend.
    const memberDataPayload = {
      profileInfo,
      role,
      invitedEmail: invitedEmail.trim() || undefined,
      // userId: undefined, // Explicitly undefined unless you have a way to provide an existing user's ID
    };

    dispatch(addNewFamilyMember({ familyId, memberData: memberDataPayload, invitedByUserId: currentUser.uid }))
      .unwrap()
      .then(() => {
        setSuccessMessage(`Membre "${firstName}" invité/ajouté avec succès.`);
        // Reset form
        setFirstName('');
        setLastName('');
        setRelationship('');
        setInvitedEmail('');
        setRole(FamilyMemberRole.MEMBER);
        onMemberInvited(); // Trigger refresh in parent
        setTimeout(() => setSuccessMessage(null), 3000); // Clear success message
      })
      .catch((error) => {
        // Error is handled by apiError selector, but you can log it or set local error if needed
        console.error("Failed to invite/add member:", error);
        // setFormError(typeof error === 'string' ? error : "Erreur lors de l'invitation/ajout.");
      });
  };

  const currentDisplayError = formError || apiError;

  return (
    <Paper elevation={0} sx={{ p: 2, mt: 0 /* Removed margin top for better tab integration */ }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Inviter ou Ajouter un Membre
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="firstName"
          label="Prénom"
          name="firstName"
          autoFocus
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isLoading}
          error={!!formError && !firstName.trim()}
          helperText={!!formError && !firstName.trim() ? "Prénom requis" : ""}
        />
        <TextField
          margin="normal"
          fullWidth
          id="lastName"
          label="Nom (optionnel)"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="relationship"
          label="Relation (ex: Mère, Ami)"
          name="relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          disabled={isLoading}
          error={!!formError && !relationship.trim()}
          helperText={!!formError && !relationship.trim() ? "Relation requise" : ""}
        />
        <TextField
          margin="normal"
          fullWidth
          id="invitedEmail"
          label="Email d'invitation (si compte existant/désiré)"
          name="invitedEmail"
          type="email"
          value={invitedEmail}
          onChange={(e) => setInvitedEmail(e.target.value)}
          disabled={isLoading}
          error={!!formError && invitedEmail && !invitedEmail.includes('@')}
          helperText={!!formError && invitedEmail && !invitedEmail.includes('@') ? "Email invalide" : ""}
        />
        <FormControl fullWidth margin="normal" required disabled={isLoading}>
          <InputLabel id="role-select-label">Rôle du membre</InputLabel>
          <Select
            labelId="role-select-label"
            id="role"
            value={role}
            label="Rôle du membre"
            onChange={(e: SelectChangeEvent<FamilyMemberRole>) => setRole(e.target.value as FamilyMemberRole)}
          >
            {Object.values(FamilyMemberRole).map(r => (
              <MenuItem key={r} value={r}>
                {r === FamilyMemberRole.ADMIN ? "Admin" : r === FamilyMemberRole.SECONDARY_ADMIN ? "Admin Secondaire" : "Membre"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {currentDisplayError && <Alert severity="error" sx={{ mt: 2 }}>{currentDisplayError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Inviter / Ajouter Membre"}
        </Button>
      </Box>
    </Paper>
  );
};

export default FamilyMemberInviteForm;
