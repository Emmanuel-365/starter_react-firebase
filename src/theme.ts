import { createTheme, ThemeOptions } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#556cd6', // Example primary color
    },
    secondary: {
      main: '#19857b', // Example secondary color
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff', // Default background color
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    // You can define other typography variants here
  },
  // You can also customize other aspects like spacing, breakpoints, components defaults etc.
  // components: {
  //   MuiButton: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: 8,
  //       },
  //     },
  //   },
  // },
};

const theme = createTheme(themeOptions);

export default theme;

console.log('Material UI theme created.'); // Optional: for development confirmation
