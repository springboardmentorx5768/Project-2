import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Container, Paper } from '@mui/material';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // THIS BLOCK IS NOW FIXED
      const response = await axios.post('http://localhost:8000/users/', {
        email: email,
        password: password,
        role: "member"
      });
      setMessage('User successfully registered! ID: ' + response.data.id);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Registration failed!');
      } else {
        setMessage('Could not connect to the server. Please make sure the backend is running.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 4, padding: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Register New User
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
          </Box>
          {message && <Typography color="textSecondary" align="center">{message}</Typography>}
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;