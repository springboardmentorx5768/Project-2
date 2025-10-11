import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import Register from './Register';
import Login from './Login';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import BragBoard from './components/BragBoard';
import Members from './components/Members'; // <-- IMPORT THE NEW COMPONENT

import './App.css';

const Dashboard = () => (
  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
    <h3 className="text-3xl font-bold mb-4 text-gray-800">Dashboard Home</h3>
    <p className="text-gray-600">This is where the main dashboard analytics and content will go.</p>
  </div>
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
          <Route path="/members" element={<PrivateRoute><Layout><Members /></Layout></PrivateRoute>} /> {/* THIS LINE IS UPDATED */}
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;