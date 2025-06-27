import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Container, Paper, Avatar, TextField, Button, Chip, IconButton, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Edit as EditIcon, CameraAlt as CameraAltIcon, Save as SaveIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../services/firebase'; // Firebase Storage n'est plus importé
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../services/cloudinaryService'; // Importation du service Cloudinary

// Interface pour les données du profil utilisateur
interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string;
  bio?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  favoriteCuisines?: string[];
  cookingLevel?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | '';
  displayName?: string; 
}

const initialProfileData: UserProfile = {
  uid: '',
  firstName: '',
  lastName: '',
  email: '',
  profilePictureUrl: '',
  bio: '',
  dietaryPreferences: [],
  allergies: [],
  favoriteCuisines: [],
  cookingLevel: '',
  displayName: 'Utilisateur Anonyme',
};


const ProfilePage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const [profileData, setProfileData] = useState<UserProfile>(initialProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        setLoading(true);
        setError(null);
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfileData({
              ...initialProfileData, 
              ...data,
              uid: currentUser.uid,
              email: currentUser.email || '', 
              displayName: currentUser.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Utilisateur',
              profilePictureUrl: data.profilePictureUrl || currentUser.photoURL || '',
            });
          } else {
            setProfileData({
              ...initialProfileData,
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Nouvel Utilisateur',
              profilePictureUrl: currentUser.photoURL || '',
            });
            await setDoc(userDocRef, { uid: currentUser.uid, email: currentUser.email, createdAt: new Date() });
          }
        } catch (err) {
          console.error("Erreur de chargement du profil:", err);
          setError("Impossible de charger les informations du profil.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleChipDelete = (type: keyof Pick<UserProfile, 'dietaryPreferences' | 'allergies' | 'favoriteCuisines'>, chipToDelete: string) => () => {
    setProfileData(prev => {
      const currentItems = prev[type] || [];
      return {
        ...prev,
        [type]: currentItems.filter((chip) => chip !== chipToDelete),
      };
    });
  };

  const handleAddChip = (type: keyof Pick<UserProfile, 'dietaryPreferences' | 'allergies' | 'favoriteCuisines'>, newValue: string) => {
    if (newValue.trim() !== '') {
      setProfileData(prev => {
        const currentItems = prev[type] || [];
        if (!currentItems.includes(newValue.trim())) {
          return {
            ...prev,
            [type]: [...currentItems, newValue.trim()],
          };
        }
        return prev;
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      setError("Utilisateur non authentifié.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let newProfilePictureUrl = profileData.profilePictureUrl;

    if (selectedFile) {
      try {
        newProfilePictureUrl = await uploadImageToCloudinary(selectedFile); // Utilisation de Cloudinary
      } catch (uploadError) {
        console.error("Erreur de téléversement de l'image vers Cloudinary:", uploadError);
        setError("Erreur lors du téléversement de la nouvelle photo de profil.");
        setLoading(false);
        return;
      }
    }

    const userDocRef = doc(db, "users", currentUser.uid);
    // Préparer les données à sauvegarder, en excluant les champs gérés par l'auth ou non modifiables directement ici
    const { uid, email, displayName, ...dataToSaveFromState } = profileData;
    const dataToSave: Partial<UserProfile> = {
        ...dataToSaveFromState, // Utilise les données de l'état actuel (firstName, lastName, bio, etc.)
        profilePictureUrl: newProfilePictureUrl, // Met à jour avec la nouvelle URL d'image
    };


    try {
      await setDoc(userDocRef, dataToSave, { merge: true });
      setProfileData(prev => ({ ...prev, profilePictureUrl: newProfilePictureUrl })); // Met à jour l'état local avec la nouvelle URL
      setSuccessMessage("Profil mis à jour avec succès !");
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Erreur de sauvegarde du profil:", err);
      setError("Impossible de sauvegarder les modifications du profil.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setImagePreview(null);
    // Re-fetch profile data to discard changes
    if (currentUser) {
        const fetchUserProfile = async () => { // Renommé pour clarté, même si c'est la même logique que useEffect
            setLoading(true);
            const userDocRef = doc(db, "users", currentUser.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setProfileData({
                        ...initialProfileData,
                        ...data,
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        displayName: currentUser.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Utilisateur',
                        profilePictureUrl: data.profilePictureUrl || currentUser.photoURL || '',
                    });
                }
            } catch (err) {
                console.error("Erreur de rechargement du profil après annulation:", err);
                setError("Impossible de recharger les informations du profil après l'annulation.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }
  };

  if (loading && !profileData.uid) { 
    return <Container sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}><CircularProgress size={60} /></Container>;
  }

  if (!currentUser && !loading) {
    return (
      <Container sx={{mt: 4}}>
        <Alert severity="warning">Veuillez vous connecter pour voir votre profil.</Alert>
      </Container>
    );
  }
  
  const currentDisplayName = profileData.firstName || profileData.lastName ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : profileData.displayName;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, position: 'relative' }}>
        {loading && <CircularProgress sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10}}/>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={imagePreview || profileData.profilePictureUrl || undefined}
              alt={currentDisplayName}
              sx={{ width: 150, height: 150, mb: 2, border: '4px solid', borderColor: 'primary.main' }}
            />
            {isEditing && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraAltIcon />}
                size="small"
                sx={{ mb: 2 }}
                disabled={loading}
              >
                Changer Photo
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            )}
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: 'primary.dark' }}>
              {isEditing ? (
                <>
                  <TextField
                    label="Prénom"
                    name="firstName"
                    value={profileData.firstName || ''}
                    onChange={handleInputChange}
                    variant="standard"
                    size="small"
                    sx={{mb:1, width: '80%'}}
                    disabled={loading}
                  />
                  <TextField
                    label="Nom"
                    name="lastName"
                    value={profileData.lastName || ''}
                    onChange={handleInputChange}
                    variant="standard"
                    size="small"
                    sx={{width: '80%'}}
                    disabled={loading}
                  />
                </>
              ) : (
                currentDisplayName
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
              {profileData.email}
            </Typography>
            
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ width: 'fit-content' }}
                disabled={loading}
              >
                Modifier le Profil
              </Button>
            ) : (
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%'}}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                  fullWidth
                >
                  Sauvegarder
                </Button>
                <Button
                    variant="text"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    fullWidth
                >
                    Annuler
                </Button>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main', mb: 2 }}>
                À propos de moi
              </Typography>
              {isEditing ? (
                <TextField
                  label="Bio"
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                />
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {profileData.bio || "Aucune biographie pour le moment."}
                </Typography>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoSection title="Préférences Alimentaires" items={profileData.dietaryPreferences || []} type="dietaryPreferences" isEditing={isEditing} onChipDelete={handleChipDelete} onAddChip={handleAddChip} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoSection title="Allergies" items={profileData.allergies || []} type="allergies" isEditing={isEditing} onChipDelete={handleChipDelete} onAddChip={handleAddChip} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoSection title="Cuisines Favorites" items={profileData.favoriteCuisines || []} type="favoriteCuisines" isEditing={isEditing} onChipDelete={handleChipDelete} onAddChip={handleAddChip} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.dark', mb: 1 }}>
                    Niveau en Cuisine
                  </Typography>
                  {isEditing ? (
                    <TextField
                      label="Niveau en Cuisine"
                      name="cookingLevel"
                      value={profileData.cookingLevel || ''}
                      onChange={handleInputChange}
                      select
                      SelectProps={{ native: true }}
                      fullWidth
                      variant="outlined"
                      disabled={loading}
                    >
                      <option value="">Non spécifié</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Expert">Expert</option>
                    </TextField>
                  ) : (
                     profileData.cookingLevel ? 
                     <Chip label={profileData.cookingLevel} color="primary" sx={{fontSize: '1rem'}} /> : 
                     <Typography variant="body2" color="text.secondary">Non spécifié.</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

interface InfoSectionProps {
  title: string;
  items: string[];
  type: keyof Pick<UserProfile, 'dietaryPreferences' | 'allergies' | 'favoriteCuisines'>;
  isEditing: boolean;
  onChipDelete: (type: keyof Pick<UserProfile, 'dietaryPreferences' | 'allergies' | 'favoriteCuisines'>, chipToDelete: string) => () => void;
  onAddChip: (type: keyof Pick<UserProfile, 'dietaryPreferences' | 'allergies' | 'favoriteCuisines'>, newValue: string) => void;
  disabled?: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, items, type, isEditing, onChipDelete, onAddChip, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = () => {
    onAddChip(type, inputValue);
    setInputValue('');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'secondary.dark', mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items && items.length > 0 ? items.map((item) => (
          <Chip
            key={item}
            label={item}
            onDelete={isEditing ? onChipDelete(type, item) : undefined}
            color={isEditing ? "default" : "secondary"}
            variant={isEditing ? "outlined" : "filled"}
            disabled={disabled}
          />
        )) : (
          !isEditing && <Typography variant="body2" color="text.secondary">Non spécifié.</Typography>
        )}
      </Box>
      {isEditing && (
        <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
          <TextField
            size="small"
            variant="outlined"
            label={`Ajouter ${title.slice(0, -1).toLowerCase()}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !disabled && handleAddItem()}
            disabled={disabled}
          />
          <Button size="small" onClick={handleAddItem} variant="contained" color="secondary" sx={{minWidth: 'auto', p: '6px 12px'}} disabled={disabled}>
            Ajouter
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage;
