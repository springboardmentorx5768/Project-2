import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

function AuthLayout({ children }) {
  return (
    <div className="App">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: 'bold', 
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)' 
          }}
        >
          <FitnessCenterIcon sx={{ fontSize: 'inherit', mr: 1.5 }} />
          BragBoard: Internal Employee Recognition Wall
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/register" variant="contained" sx={{ mr: 2 }}>
            Register
          </Button>
          <Button component={Link} to="/login" variant="contained" color="secondary">
            Login
          </Button>
        </Box>
      </Box>

      {/* This is where the Login or Register form will be displayed */}
      {children}
    </div>
  );
}

export default AuthLayout;