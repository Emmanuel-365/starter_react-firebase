import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux'; // Renamed Provider to ReduxProvider
import { store } from './redux/store';   // Import store
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}> {/* Use ReduxProvider */}
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </ReduxProvider>
  </StrictMode>,
);
