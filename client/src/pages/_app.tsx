import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../../styles/globals.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7B1FA2', // Purple
    },
    secondary: {
      main: '#C2185B', // Pink
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
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