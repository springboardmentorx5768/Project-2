import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Imports ko clean kiya
import Register from './Register';
import Login from './Login';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import BragBoard from './components/BragBoard';
import Members from './components/Members';
import Shoutout from './components/Shoutout';
import ShoutoutFeed from './components/ShoutoutFeed'; // <-- IMPORT FEED
import './App.css';

// --- YEH CHANGE SABSE IMPORTANT HAI ---
// Dashboard ab "Feed" dikhayega
const Dashboard = () => (
  <ShoutoutFeed />
);
// -------------------------------------

// Aapka PrivateRoute (localStorage wala) - Bilkul sahi hai
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// --- YEH NAYA PROFESSIONAL THEME HAI ---
// (Aapka theme code yahan copy-paste kiya hai)
const professionalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#f44336',
    },
    background: {
      default: '#f4f7f6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={professionalTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Aapke Auth Routes */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

          {/* --- ROUTING AB FIX HO GAYI HAI --- */}
          {/* Dashboard (default page) ab FEED dikhayega */}
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          
          {/* Shoutouts link ab FORM dikhayega */}
          <Route path="/shoutouts" element={<PrivateRoute><Layout><Shoutout /></Layout></PrivateRoute>} />
          
          <Route path="/brag-board" element={<PrivateRoute><Layout><BragBoard /></Layout></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} />

          {/* Default route ko /dashboard par bhej do (login ke baad) */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;