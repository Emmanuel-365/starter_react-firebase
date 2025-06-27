import { createTheme, ThemeOptions } from '@mui/material/styles';
import { amber, green, grey, red } from '@mui/material/colors';

// A custom theme for this culinary app
const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#ff9800', // Un orange vibrant pour l'appétit et l'énergie
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4caf50', // Un vert pour la fraîcheur et les ingrédients naturels
      contrastText: '#ffffff',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f5f5f5', // Un fond gris clair pour la propreté et la modernité
      paper: '#ffffff', // Fond des cartes et des surfaces
    },
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 700,
      color: green[800], // Un vert foncé pour les titres principaux
    },
    h2: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 700,
      color: green[700],
    },
    h3: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 700,
      color: green[600],
    },
    h4: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      color: amber[900], // Une touche d'orange foncé pour les sous-titres
    },
    h5: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    subtitle2: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    body1: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      textTransform: 'none', // Pour un style de bouton plus moderne
    },
  },
  shape: {
    borderRadius: 12, // Bords arrondis pour un look plus doux
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // AppBar blanche pour un look épuré
          color: grey[800],
          boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.06), 0 1px 10px 0 rgba(0,0,0,0.04)', // Ombre subtile
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Ombre plus prononcée pour les cartes
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Cohérence avec shape.borderRadius
          padding: '10px 20px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#e68900', // Assombrir légèrement au survol
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#388e3c', // Assombrir légèrement au survol
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: green[700], // Couleur du label quand le champ est focus
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: green[500], // Couleur de la bordure quand focus
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: amber[100],
          color: amber[800],
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: green[100],
          color: green[800],
        },
        colorSecondary: {
          backgroundColor: amber[100],
          color: amber[800],
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;

console.log('Culinary Material UI theme created.');
