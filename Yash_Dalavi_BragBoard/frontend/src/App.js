import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import Register from './Register';
import Login from './Login';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import BragBoard from './components/BragBoard';
import Members from './components/Members';
import Shoutout from './components/Shoutout';
import ShoutoutFeed from './components/ShoutoutFeed'; // <-- 1. IMPORT THE NEW COMPONENT
import './App.css';

// 2. THIS IS NOW UPDATED TO SHOW THE SHOUT-OUT FEED
const Dashboard = () => (
  <ShoutoutFeed />
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/brag-board" element={<PrivateRoute><Layout><BragBoard /></Layout></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} />
          <Route path="/shoutouts" element={<PrivateRoute><Layout><Shoutout /></Layout></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;