import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

function BragBoard() {
  // State for the form fields
  const [name, setName] = useState('Yash Dalavi'); // Default name
  const [projectName, setProjectName] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [skills, setSkills] = useState('');
  
  // State for the list of brag sheets fetched from backend
  const [bragSheets, setBragSheets] = useState([]);
  const [message, setMessage] = useState('');

  // Function to get the saved token from the browser
  const getToken = () => localStorage.getItem('token');

  // This function fetches all brag sheets for the logged-in user
  const fetchBragSheets = async () => {
    const token = getToken();
    if (!token) {
        setMessage("You need to be logged in.");
        return;
    }

    try {
      const response = await axios.get('http://localhost:8000/bragsheets/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBragSheets(response.data);
    } catch (error) {
      console.error('Error fetching brag sheets:', error);
      setMessage('Could not fetch projects.');
    }
  };

  // This `useEffect` hook runs once when the page loads to fetch the projects
  useEffect(() => {
    fetchBragSheets();
  }, []);

  // This function runs when you click the "Add Project" button
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
        setMessage('You are not logged in!');
        return;
    }

    try {
      await axios.post('http://localhost:8000/bragsheets/', {
        name: name,
        project_name: projectName,
        countofmember: parseInt(memberCount),
        skills: skills
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('New project added successfully!');
      fetchBragSheets(); // Refresh the list after adding a new one
      
      // Clear the form fields
      setProjectName('');
      setSkills('');
      setMemberCount(1);

    } catch (error) {
      setMessage('Failed to add project.');
      console.error('There was an error!', error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-4xl">
      <Typography variant="h4" component="h1" gutterBottom>My Brag Board</Typography>

      {/* Form to create a new entry */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField fullWidth margin="normal" label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
        <TextField fullWidth margin="normal" label="Skills Used (e.g., React, Python)" value={skills} onChange={(e) => setSkills(e.target.value)} required />
        <TextField fullWidth margin="normal" label="Number of Members" type="number" value={memberCount} onChange={(e) => setMemberCount(e.target.value)} required InputProps={{ inputProps: { min: 1 } }} />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Project</Button>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </Box>

      {/* List of existing entries */}
      <Typography variant="h5" component="h2" gutterBottom>My Projects</Typography>
      <List>
        {bragSheets.map((sheet) => (
          <Paper key={sheet.id} sx={{ mb: 2, p: 2 }}>
            <ListItemText
              primary={<Typography variant="h6">{sheet.project_name}</Typography>}
              secondary={`Skills: ${sheet.skills} | Members: ${sheet.countofmember}`}
            />
          </Paper>
        ))}
      </List>
    </div>
  );
}

export default BragBoard;