import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 'Link' ko import kiya
import { Box, Button, TextField, Typography, Container, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 'message' state ko 'error' naam diya, naye design ke sath match karne ke liye
    const [error, setError] = useState(''); 
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Aapka URLSearchParams logic - bilkul sahi hai
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        try {
            const response = await axios.post(
                'http://localhost:8000/token', 
                params,
                // Yeh header zaroori hai FastAPI ke OAuth2PasswordRequestForm ke liye
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            
            // Aapka localStorage logic - bilkul sahi hai
            localStorage.setItem('token', response.data.access_token);
            
            // Login successful, ab dashboard par jao
            navigate('/dashboard'); 

        } catch (err) {
            // Aapka error handling logic
            if (err.response) {
                setError(err.response.data.detail || 'Incorrect email or password');
            } else {
                setError('Could not connect to the server.');
            }
        }
    };

    // Yeh naya professional UI wala JSX hai
    return (
        <Container component="main" maxWidth="xs">
            <Paper 
                elevation={3} 
                sx={{
                    marginTop: 8,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'background.paper', // Theme se white lega
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    BragBoard Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
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
                    {/* Error message yahan dikhega */}
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }} // Thoda bada button
                    >
                        Sign In
                    </Button>
                    {/* Register page ka link */}
                    <Box textAlign="center">
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="primary">
                                {"Don't have an account? Sign Up"}
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;