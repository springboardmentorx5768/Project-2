import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { indigo, red } from '@mui/material/colors'; 
import Register from './Register';
import Login from './Login';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import BragBoard from './components/BragBoard';
import Members from './components/Members';
import Shoutout from './components/Shoutout';
import ShoutoutFeed from './components/ShoutoutFeed'; 
import AdminDashboard from './components/AdminDashboard';
import Leaderboard from './components/Leaderboard'; // <-- NAYA IMPORT
import './App.css';

// Dashboard ab "Feed" dikhayega
const Dashboard = () => (
  <ShoutoutFeed />
);

// Aapka PrivateRoute
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Professional Theme
const professionalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: indigo[500], 
    },
    secondary: {
      main: red[500], 
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
          {/* Auth Routes */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/shoutouts" element={<PrivateRoute><Layout><Shoutout /></Layout></PrivateRoute>} />
          <Route path="/brag-board" element={<PrivateRoute><Layout><BragBoard /></Layout></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Layout><AdminDashboard /></Layout></PrivateRoute>} />
          
          {/* --- YEH NAYA ROUTE ADD HUA HAI --- */}
          <Route path="/leaderboard" element={<PrivateRoute><Layout><Leaderboard /></Layout></PrivateRoute>} />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;