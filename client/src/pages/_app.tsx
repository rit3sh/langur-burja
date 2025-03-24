import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../../styles/globals.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700', // Gold
      light: '#FFEB3B',
      dark: '#FFA000',
      contrastText: '#000',
    },
    secondary: {
      main: '#F44336', // Red
      light: '#FF7961',
      dark: '#BA000D',
      contrastText: '#fff',
    },
    background: {
      default: '#0F172A',
      paper: 'rgba(23, 33, 43, 0.8)',
    },
    text: {
      primary: '#F8F9FA',
      secondary: '#ADB5BD',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#FF3D00',
      light: '#FF6E40',
      dark: '#DD2C00',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.03em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 7px 14px rgba(0, 0, 0, 0.18)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #FFD700 30%, #FFC107 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #F44336 30%, #FF5252 90%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp; 