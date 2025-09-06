import { createTheme } from '@mui/material/styles';

// Создаем кастомную тему с приглушенными цветами
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C3E50', // темно-синий
      light: '#34495E',
      dark: '#1B2631',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3498DB', // приглушенный синий
      light: '#5DADE2',
      dark: '#2980B9',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#27AE60', // мягкий зеленый
      light: '#58D68D',
      dark: '#1E8449',
    },
    warning: {
      main: '#F39C12', // приглушенный оранжевый
      light: '#F8C471',
      dark: '#D68910',
    },
    error: {
      main: '#E74C3C',
      light: '#F1948A',
      dark: '#C0392B',
    },
    background: {
      default: '#FAFAFA', // светло-серый
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    grey: {
      50: '#FDFEFE',
      100: '#FBFCFC',
      200: '#F8F9FA',
      300: '#F4F6F7',
      400: '#D5DBDB',
      500: '#85929E',
      600: '#5D6D7E',
      700: '#34495E',
      800: '#2C3E50',
      900: '#1B2631',
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
    ].join(','),
    h1: {
      fontSize: '2.625rem', // +0.125rem (≈2px)
      fontWeight: 600,
      color: '#2C3E50',
    },
    h2: {
      fontSize: '2.125rem', // +0.125rem (≈2px)
      fontWeight: 600,
      color: '#2C3E50',
    },
    h3: {
      fontSize: '1.875rem', // +0.125rem (≈2px)
      fontWeight: 500,
      color: '#2C3E50',
    },
    h4: {
      fontSize: '1.625rem', // +0.125rem (≈2px)
      fontWeight: 500,
      color: '#2C3E50',
    },
    h5: {
      fontSize: '1.375rem', // +0.125rem (≈2px)
      fontWeight: 500,
      color: '#2C3E50',
    },
    h6: {
      fontSize: '1.125rem', // +0.125rem (≈2px)
      fontWeight: 500,
      color: '#2C3E50',
    },
    body1: {
      fontSize: '1.125rem', // +0.125rem (≈2px)
      color: '#2C3E50',
    },
    body2: {
      fontSize: '1rem', // +0.125rem (≈2px)
      color: '#7F8C8D',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '1rem', // +0.125rem (≈2px) от стандартного 0.875rem
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #F4F6F7',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontSize: '0.85rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2C3E50',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;
