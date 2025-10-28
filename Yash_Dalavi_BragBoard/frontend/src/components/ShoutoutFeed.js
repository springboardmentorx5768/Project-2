import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Typography, Paper, List, ListItemText, Divider, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Avatar from './Avatar'; // Import your Avatar component

function ShoutoutFeed() {
  const [shoutouts, setShoutouts] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSender, setFilterSender] = useState('');
  
  const getToken = () => localStorage.getItem('token');

  const fetchShoutouts = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams();
    if (filterDepartment) {
      params.append('department', filterDepartment);
    }
    if (filterSender) {
      params.append('sender_email', filterSender);
    }

    try {
      const response = await axios.get(`http://localhost:8000/shoutouts/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: params 
      });
      setShoutouts(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching shoutouts:', error);
    }
  }, [filterDepartment, filterSender]);

  useEffect(() => {
    fetchShoutouts();
  }, [fetchShoutouts]);

  const handleFilterSubmit = (e) => {
      e.preventDefault();
      fetchShoutouts();
  };

  const departments = ["general", "admin", "trainer", "member"];

  return (
    // --- THIS DIV IS NOW CLEANER ---
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-4xl">
      <Typography variant="h5" component="h2" gutterBottom>
        Recent Shout-outs
      </Typography>

      <Box component="form" onSubmit={handleFilterSubmit} sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={filterDepartment}
            label="Department"
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <MenuItem value=""><em>All Departments</em></MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Sender Email"
          variant="outlined"
          value={filterSender}
          onChange={(e) => setFilterSender(e.target.value)}
        />
        
        <Button type="submit" variant="contained">Filter</Button>
      </Box>

      <List>
        {shoutouts.length === 0 && <Typography>No shout-outs found for these filters.</Typography>}
        {shoutouts.map((shoutout) => (
          // --- THIS CARD IS ALSO CLEANER ---
          <Paper key={shoutout.id} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}> 
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar email={shoutout.author?.email || 'A'} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{shoutout.author?.email || 'Unknown'}</Typography>
                <Typography variant="body2" color="textSecondary">Tagged: {shoutout.tagged_users}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <ListItemText
              primary={<Typography variant="body1" sx={{ fontStyle: 'italic', mt: 1 }}>"{shoutout.message}"</Typography>}
            />
            {shoutout.file_url && <img src={`http://localhost:8000${shoutout.file_url}`} alt="shoutout attachment" style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }} />}
          </Paper>
        ))}
      </List>
    </div>
  );
}

export default ShoutoutFeed;