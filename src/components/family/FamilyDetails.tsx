import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Container, Box, CircularProgress, Alert, Paper, Button, Divider, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
// import GroupAddIcon from '@mui/icons-material/GroupAdd'; // For invite tab, if used
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { AuthContext } from '../../context/AuthContext';
import { FamilyMemberRole } from '../../types/FamilyMember';
import FamilyMembersList from './FamilyMembersList';
import FamilyMemberInviteForm from './FamilyMemberInviteForm'; // Will be created

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchFamilyDetails,
  selectCurrentFamily,
  selectCurrentFamilyMembers,
  selectFamilyLoading,
  selectFamilyError,
  clearFamilyError,
  setCurrentFamily // Action to manually set current family to null if needed
} from '../../redux/familySlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`family-details-tabpanel-${index}`}
      aria-labelledby={`family-details-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FamilyDetails: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const family = useAppSelector(selectCurrentFamily);
  const members = useAppSelector(selectCurrentFamilyMembers);
  const isLoading = useAppSelector(selectFamilyLoading);
  const error = useAppSelector(selectFamilyError);
  
  const [currentUserRole, setCurrentUserRole] = useState<FamilyMemberRole | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Clear previous family details and errors when component mounts or familyId/currentUser changes
    dispatch(clearFamilyError());
    // dispatch(setCurrentFamily(null)); // Optional: clear family details immediately

    if (familyId && currentUser?.uid) {
      dispatch(fetchFamilyDetails(familyId));
    } else if (!familyId) {
        // Handle missing familyId, perhaps by navigating away or showing a specific error
        // For now, error selector in Redux should catch issues from thunk
    }
  }, [familyId, currentUser, dispatch]);

  useEffect(() => {
    // Determine current user's role once members are loaded/updated
    if (currentUser && members.length > 0) {
      const member = members.find(m => m.userId === currentUser.uid);
      setCurrentUserRole(member ? member.role : null);
    } else if (members.length === 0 && !isLoading) { // If no members and not loading, user can't have a role here
        setCurrentUserRole(null);
    }
  }, [currentUser, members, isLoading]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const isAdmin = currentUserRole === FamilyMemberRole.ADMIN;

  if (isLoading && !family) { // Show loading only if family data is not yet available
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/families')}
            sx={{ mt: 2 }}
          >
            Retour à la liste des familles
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!family) {
    return ( // Should be covered by error state, but as a fallback
      <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
            <Typography variant="h6">Famille non trouvée.</Typography>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/families')}
                sx={{ mt: 2 }}
            >
                Retour à la liste des familles
            </Button>
        </Paper>
      </Container>
    );
  }
  
  const refreshMembersAndDetails = () => {
    if (familyId) {
      dispatch(fetchFamilyDetails(familyId)); // Refetches both family and members
    }
  };


  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/families')}
            >
              Mes Familles
            </Button>
            <Typography variant="h4" component="h1" sx={{ textAlign: 'center', flexGrow: 1 }}>
              {family.name}
            </Typography>
            {isAdmin && familyId && ( // Ensure familyId is defined for the link
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SettingsIcon />}
                component={RouterLink}
                to={`/families/${familyId}/settings`}
              >
                Gérer
              </Button>
            )}
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
            {family.description || "Cette famille n'a pas de description."}
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Détails de la famille tabs" centered>
            <Tab label={`Membres (${members.length})`} id="family-details-tab-0" aria-controls="family-details-tabpanel-0" />
            {isAdmin && <Tab label="Inviter un Membre" id="family-details-tab-1" aria-controls="family-details-tabpanel-1" />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <FamilyMembersList 
            members={members} 
            currentUserId={currentUser?.uid || ''} 
            currentUserRole={currentUserRole}
            familyId={family.id} // family is guaranteed to be non-null here
            onMemberUpdate={refreshMembersAndDetails} 
          />
        </TabPanel>
        
        {isAdmin && familyId && ( // Ensure familyId is defined for the form
          <TabPanel value={tabValue} index={1}>
             <FamilyMemberInviteForm familyId={familyId} onMemberInvited={refreshMembersAndDetails} />
          </TabPanel>
        )}

      </Paper>
    </Container>
  );
};

export default FamilyDetails;
