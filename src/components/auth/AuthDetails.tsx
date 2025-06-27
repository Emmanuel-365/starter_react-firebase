import React, { useEffect, useState, useContext } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebase'; // Assurez-vous que db est exporté depuis firebase.ts
import { doc, getDoc } from 'firebase/firestore';
import { Button, Typography, Box, Avatar, IconButton, Menu, MenuItem, ListItemIcon, Divider, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings'; // Juste un exemple d'icône

const AuthDetails: React.FC = () => {
  const authContext = useContext(AuthContext);
  const authUser = authContext?.user;
  const isLoadingAuth = authContext?.loading;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(false);


  useEffect(() => {
    const fetchUserProfileMini = async () => {
      if (authUser) {
        setLoadingProfile(true);
        const userDocRef = doc(db, "users", authUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfilePictureUrl(data.profilePictureUrl || authUser.photoURL);
            setDisplayName(data.firstName || authUser.displayName || authUser.email?.split('@')[0] || "Utilisateur");
          } else {
            // Profil non trouvé dans Firestore, utiliser les infos de Firebase Auth
            setProfilePictureUrl(authUser.photoURL || undefined);
            setDisplayName(authUser.displayName || authUser.email?.split('@')[0] || "Utilisateur");
          }
        } catch (error) {
          console.error("Erreur de chargement des informations du profil (mini):", error);
          // Fallback aux infos de Firebase Auth en cas d'erreur
          setProfilePictureUrl(authUser.photoURL || undefined);
          setDisplayName(authUser.displayName || authUser.email?.split('@')[0] || "Utilisateur");
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    if (!isLoadingAuth) { // Ne fetcher que si l'état d'auth est déterminé
        fetchUserProfileMini();
    }
    // Re-fetch if authUser changes (e.g., login/logout)
  }, [authUser, isLoadingAuth]);


  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleProfileNavigation = () => {
    handleClose();
    navigate('/profile');
  };
  
  if (isLoadingAuth) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', width: '100%' }}>
      <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'primary.main' }}>
        MonAppCuisine
      </Typography>
      {authUser ? (
        <>
          <IconButton
            onClick={handleMenu}
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            {loadingProfile ? <CircularProgress size={24} color="primary" /> : 
            <Avatar src={profilePictureUrl} sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {!profilePictureUrl && displayName ? displayName.charAt(0).toUpperCase() : <AccountCircle />}
            </Avatar>
            }
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem disabled sx={{display: 'flex', flexDirection:'column', alignItems: 'flex-start', pointerEvents: 'none'}}>
                <Typography variant="subtitle1" component="div" sx={{fontWeight: 'bold'}}>
                    {displayName || "Utilisateur"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {authUser.email}
                </Typography>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleProfileNavigation}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Mon Profil
            </MenuItem>
            {/* Exemple d'autre lien:
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Paramètres
            </MenuItem>
            */}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button component={RouterLink} to="/login" color="primary" variant="outlined">
          Connexion / Inscription
        </Button>
      )}
    </Box>
  );
};

export default AuthDetails;
