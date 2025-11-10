import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Button, TextField, Box, Typography, Paper, List, ListItem, 
    ListItemText, Divider, CircularProgress, Alert 
} from '@mui/material';

function BragBoard() {
    // State for the form fields
    const [projectName, setProjectName] = useState('');
    const [skills, setSkills] = useState('');
    const [memberCount, setMemberCount] = useState(1);
    
    // State for the list of brag sheets
    const [bragSheets, setBragSheets] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('token');

    // This function fetches all brag sheets
    const fetchBragSheets = async () => {
        const token = getToken();
        if (!token) {
            setError("You need to be logged in.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/bragsheets/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBragSheets(response.data);
        } catch (error) {
            console.error('Error fetching brag sheets:', error);
            setError('Could not fetch projects.');
        }
        setLoading(false);
    };

    // Run once when the page loads
    useEffect(() => {
        fetchBragSheets();
    }, []);

    // Runs when "Add Project" button is clicked
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            setMessage('You are not logged in!');
            return;
        }

        try {
            await axios.post('http://localhost:8000/bragsheets/', {
                // 'name' field aapke original code mein nahi tha,
                // but backend model mein hai. Hum ek default add kar rahe hain.
                project_name: projectName,
                countofmember: parseInt(memberCount),
                skills: skills,
                name: "My Project" // Default name
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setMessage('New project added successfully!');
            fetchBragSheets(); // Refresh the list
            
            // Clear the form fields
            setProjectName('');
            setSkills('');
            setMemberCount(1);

            // Hide message after 3 seconds
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            setMessage('Failed to add project.');
            console.error('There was an error!', error);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ maxWidth: 700, margin: 'auto' }}>{error}</Alert>;
    }

    return (
        <Paper elevation={3} sx={{ maxWidth: 900, margin: 'auto', p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                My Brag Board
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Track your personal projects and accomplishments here.
            </Typography>
            
            {/* Form to create a new entry */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField 
                    fullWidth 
                    margin="normal" 
                    label="Project Name" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)} 
                    required 
                />
                <TextField 
                    fullWidth 
                    margin="normal" 
                    label="Skills Used (e.g., React, Python)" 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)} 
                    required 
                />
                <TextField 
                    fullWidth 
                    margin="normal" 
                    label="Number of Members" 
                    type="number"
                    value={memberCount} 
                    onChange={(e) => setMemberCount(e.target.value)} 
                    required 
                    InputProps={{ inputProps: { min: 1 } }} 
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Add Project
                </Button>
                {message && (
                    <Typography 
                        sx={{ mt: 2, color: message.includes('Failed') ? 'error.main' : 'success.main' }}
                    >
                        {message}
                    </Typography>
                )}
            </Box>

            <Divider />

            {/* List of existing entries */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                My Projects
            </Typography>
            <List>
                {bragSheets.length > 0 ? bragSheets.map((sheet) => (
                    <Paper key={sheet.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <ListItemText
                            primary={<Typography variant="h6">{sheet.project_name}</Typography>}
                            secondary={`Skills: ${sheet.skills} | Members: ${sheet.countofmember}`}
                        />
                    </Paper>
                )) : (
                    <Typography color="text.secondary">You haven't added any projects yet.</Typography>
                )}
            </List>
        </Paper>
    );
}

export default BragBoard;