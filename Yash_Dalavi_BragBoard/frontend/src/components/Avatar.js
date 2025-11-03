import React from 'react';
import { Box } from '@mui/material';

// Yeh ek simple component hai jo email ka pehla akshar (letter) leta hai
// aur use ek rang-birange (colorful) circle me dikhata hai.
function Avatar({ email }) {
  // Email ka pehla akshar (letter) nikal kar use uppercase me badalna
  const initial = email ? email[0].toUpperCase() : '?';

  // Email ke basis par ek simple hash code banana
  const getHashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  // Hash code ke basis par ek rang (color) chunna
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800', '#ff5722'];
  const colorIndex = Math.abs(getHashCode(email || '')) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.25rem',
      }}
    >
      {initial}
    </Box>
  );
}

export default Avatar;