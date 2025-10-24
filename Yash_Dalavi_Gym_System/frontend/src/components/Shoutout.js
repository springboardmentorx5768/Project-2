import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Paper, List, ListItemText, Divider } from '@mui/material';

function Shoutout() {
    const [message, setMessage] = useState('');
    const [taggedUsers, setTaggedUsers] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [shoutouts, setShoutouts] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [commentText, setCommentText] = useState('');

    const getToken = () => localStorage.getItem('token');

    const fetchShoutouts = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/shoutouts/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setShoutouts(response.data);
        } catch (error) {
            console.error('Error fetching shoutouts:', error);
        }
    }, []);

    useEffect(() => {
        fetchShoutouts();
    }, [fetchShoutouts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            setStatusMessage('You are not logged in!');
            return;
        }

        let fileUrl = null;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const uploadResponse = await axios.post('http://localhost:8000/uploadfile/', formData);
                fileUrl = uploadResponse.data.url;
            } catch (error) {
                setStatusMessage('File upload failed.');
                return;
            }
        }

        try {
            await axios.post('http://localhost:8000/shoutouts/', {
                message: message,
                tagged_users: taggedUsers,
                file_url: fileUrl
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStatusMessage('Shout-out sent successfully!');
            fetchShoutouts();
            setMessage('');
            setTaggedUsers('');
            setSelectedFile(null);
        } catch (error) {
            setStatusMessage('Failed to send shout-out.');
        }
    };
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleCommentSubmit = async (shoutoutId) => {
        if (!commentText) return;
        const token = getToken();
        try {
            await axios.post(`http://localhost:8000/shoutouts/${shoutoutId}/comments/`, { text: commentText }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCommentText('');
            fetchShoutouts();
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-4xl">
            <Typography variant="h4" component="h1" gutterBottom>Send a Shout-out</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField fullWidth multiline rows={3} margin="normal" label="Your shout-out message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                <TextField fullWidth margin="normal" label="Tag users (e.g., user1@example.com)" value={taggedUsers} onChange={(e) => setTaggedUsers(e.target.value)} required />
                
                <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                    Upload Image/File
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {selectedFile && <Typography sx={{ ml: 2, display: 'inline' }}>{selectedFile.name}</Typography>}

                <Button type="submit" variant="contained" sx={{ mt: 2, display: 'block' }}>Send Shout-out</Button>
                {statusMessage && <Typography sx={{ mt: 2 }}>{statusMessage}</Typography>}
            </Box>

            <Typography variant="h5" component="h2" gutterBottom>Recent Shout-outs</Typography>
            <List>
                {shoutouts.map((shoutout) => (
                    <Paper key={shoutout.id} sx={{ mb: 2, p: 2 }}>
                        <ListItemText
                            primary={<Typography variant="body1">"{shoutout.message}"</Typography>}
                            // THIS LINE IS NOW SAFER
                            secondary={`— Sent by: ${shoutout.author?.email || 'Unknown'} | Tagged: ${shoutout.tagged_users}`}
                        />
                        {shoutout.file_url && <img src={`http://localhost:8000${shoutout.file_url}`} alt="shoutout attachment" style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }} />}
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ ml: 2 }}>Comments:</Typography>
                        <List sx={{ ml: 2 }}>
                            {shoutout.comments.map((comment) => (
                                <ListItemText key={comment.id} 
                                    // THIS LINE IS NOW SAFER
                                    secondary={`${comment.author?.email || 'Unknown'}: ${comment.text}`} 
                                />
                            ))}
                        </List>
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(shoutout.id); }} sx={{ display: 'flex', mt: 1, ml: 2 }}>
                            <TextField size="small" variant="standard" fullWidth label="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                            <Button type="submit" size="small">Post</Button>
                        </Box>
                    </Paper>
                ))}
            </List>
        </div>
    );
}

export default Shoutout;