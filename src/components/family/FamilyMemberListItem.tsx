import React, { useState, useContext } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { FamilyMember, FamilyMemberRole, FamilyMemberStatus } from '../../types/FamilyMember';
import { AuthContext } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateMemberRole, removeMember, selectFamilyLoading, selectFamilyError, clearFamilyError } from '../../redux/familySlice';

interface FamilyMemberListItemProps {
  member: FamilyMember;
  currentUserId: string;
  currentUserRole: FamilyMemberRole | null;
  // familyId: string; // Not strictly needed if member.id is globally unique and used for actions
  onMemberUpdate: () => void; // Callback to refresh list (e.g., refetch members from parent)
  divider?: boolean;
}

const FamilyMemberListItem: React.FC<FamilyMemberListItemProps> = ({
  member,
  currentUserId,
  currentUserRole,
  onMemberUpdate,
  divider,
}) => {
  const dispatch = useAppDispatch();
  // const authContext = useContext(AuthContext); // Not directly used here, currentUserId is passed

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<FamilyMemberRole>(member.role);

  const itemActionLoading = useAppSelector(selectFamilyLoading);
  const apiError = useAppSelector(selectFamilyError); // Global API error from Redux
  const [dialogSpecificError, setDialogSpecificError] = useState<string | null>(null);


  const isCurrentUserAdmin = currentUserRole === FamilyMemberRole.ADMIN;
  const isSelf = member.userId === currentUserId;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenRoleDialog = () => {
    setSelectedRole(member.role);
    setDialogSpecificError(null);
    dispatch(clearFamilyError());
    setOpenRoleDialog(true);
    handleMenuClose();
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setDialogSpecificError(null);
  };

  const handleOpenRemoveDialog = () => {
    setDialogSpecificError(null);
    dispatch(clearFamilyError());
    setOpenRemoveDialog(true);
    handleMenuClose();
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setDialogSpecificError(null);
  };

  const handleRoleChange = (event: SelectChangeEvent<FamilyMemberRole>) => {
    setSelectedRole(event.target.value as FamilyMemberRole);
  };

  const handleConfirmRoleChange = async () => {
    setDialogSpecificError(null);
    dispatch(clearFamilyError());
    dispatch(updateMemberRole({ memberId: member.id, role: selectedRole }))
      .unwrap()
      .then(() => {
        onMemberUpdate();
        handleCloseRoleDialog();
      })
      .catch((error) => {
        setDialogSpecificError(typeof error === 'string' ? error : "Failed to update role.");
        console.error("Error updating role:", error);
      });
  };

  const handleConfirmRemove = async () => {
    setDialogSpecificError(null);
    dispatch(clearFamilyError());
    // Basic check: Prevent admin from removing themselves if they are the last admin.
    // This logic should ideally be more robust and potentially exist in the backend/service.
    // For now, a simple client-side guard.
    // if (isSelf && member.role === FamilyMemberRole.ADMIN) {
    //   // A more complex check would be needed here, potentially involving fetching all members
    //   // to see if other admins exist. For simplicity, this check is omitted here
    //   // but should be considered for a production app.
    //   setDialogSpecificError("Admins cannot remove themselves if they are the last admin. Promote another member first or delete the family.");
    //   return;
    // }

    dispatch(removeMember(member.id))
      .unwrap()
      .then(() => {
        onMemberUpdate();
        handleCloseRemoveDialog();
      })
      .catch((error) => {
        setDialogSpecificError(typeof error === 'string' ? error : "Failed to remove member.");
        console.error("Error removing member:", error);
      });
  };

  const getStatusChip = () => {
    switch (member.status) {
      case FamilyMemberStatus.ACTIVE:
        return <Chip icon={<CheckCircleIcon />} label="Actif" color="success" size="small" variant="outlined" sx={{ml:1}}/>;
      case FamilyMemberStatus.PENDING:
        return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" variant="outlined" sx={{ml:1}}/>;
      case FamilyMemberStatus.DECLINED:
        return <Chip icon={<CancelIcon />} label="Refusé" color="error" size="small" variant="outlined" sx={{ml:1}}/>;
      default:
        return null;
    }
  }

  // Display global API error if no dialog-specific error is set
  const currentError = dialogSpecificError || apiError;

  return (
    <>
      <ListItem
        sx={{
          py: 1.5,
          backgroundColor: isSelf ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: isSelf ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: member.role === FamilyMemberRole.ADMIN ? 'primary.main' : 'secondary.light' }}>
            {member.role === FamilyMemberRole.ADMIN ? <AdminPanelSettingsIcon /> : <PersonIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center">
                <Typography variant="body1">
                {member.profileInfo.firstName} {member.profileInfo.lastName || ''}
                {isSelf && <Typography component="span" variant="caption" color="textSecondary" sx={{ml:0.5}}>(Vous)</Typography>}
                </Typography>
                {getStatusChip()}
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary">
                Rôle: {member.role === FamilyMemberRole.ADMIN ? "Admin" : member.role === FamilyMemberRole.SECONDARY_ADMIN ? "Admin Secondaire" : "Membre"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Relation: {member.profileInfo.relationship}
              </Typography>
              {member.userId &&
                <Typography variant="caption" display="block" color="text.secondary" >User ID: {member.userId.substring(0,10)}...</Typography>
              }
               {member.invitedEmail &&
                <Typography variant="caption" display="block" color="text.secondary" >Invité: {member.invitedEmail}</Typography>
              }
            </>
          }
        />
        {isCurrentUserAdmin && !isSelf && (
          <IconButton
            edge="end"
            aria-label="manage-member"
            aria-controls={`member-menu-${member.id}`}
            aria-haspopup="true"
            onClick={handleMenuOpen}
            disabled={itemActionLoading}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </ListItem>
      {divider && <Divider variant="inset" component="li" />}

      {isCurrentUserAdmin && !isSelf && (
        <Menu
          id={`member-menu-${member.id}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleOpenRoleDialog} disabled={itemActionLoading}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Modifier le rôle
          </MenuItem>
          <MenuItem onClick={handleOpenRemoveDialog} sx={{color: 'error.main'}} disabled={itemActionLoading}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{color: 'error.main'}}/>
            </ListItemIcon>
            Supprimer le membre
          </MenuItem>
        </Menu>
      )}

      {/* Dialog for Changing Role */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} aria-labelledby="change-role-dialog-title">
        <DialogTitle id="change-role-dialog-title">Modifier le rôle de {member.profileInfo.firstName}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Sélectionnez le nouveau rôle pour ce membre.
          </DialogContentText>
          {currentError && <Alert severity="error" sx={{ mb: 2 }}>{currentError}</Alert>}
          <FormControl fullWidth>
            <InputLabel id={`role-select-label-${member.id}`}>Rôle</InputLabel>
            <Select
              labelId={`role-select-label-${member.id}`}
              id={`role-select-${member.id}`}
              value={selectedRole}
              label="Rôle"
              onChange={handleRoleChange}
              disabled={itemActionLoading}
            >
              {Object.values(FamilyMemberRole).map((roleValue) => (
                <MenuItem key={roleValue} value={roleValue}>
                  {roleValue === FamilyMemberRole.ADMIN ? "Admin" : roleValue === FamilyMemberRole.SECONDARY_ADMIN ? "Admin Secondaire" : "Membre"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} disabled={itemActionLoading}>Annuler</Button>
          <Button onClick={handleConfirmRoleChange} variant="contained" disabled={itemActionLoading}>
            {itemActionLoading ? <CircularProgress size={24} /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Removing Member */}
      <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog} aria-labelledby="remove-member-dialog-title">
        <DialogTitle id="remove-member-dialog-title">Supprimer {member.profileInfo.firstName}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce membre de la famille ? Cette action est irréversible.
          </DialogContentText>
          {currentError && <Alert severity="error" sx={{ mt: 2 }}>{currentError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} disabled={itemActionLoading}>Annuler</Button>
          <Button onClick={handleConfirmRemove} variant="contained" color="error" disabled={itemActionLoading}>
            {itemActionLoading ? <CircularProgress size={24} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FamilyMemberListItem;
