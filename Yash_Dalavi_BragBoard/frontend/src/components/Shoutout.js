import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';

// Yeh component ab sirf "Send a Shout-out" ka form hai
function Shoutout() {
    const [message, setMessage] = useState('');
    const [taggedUsers, setTaggedUsers] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    const getToken = () => localStorage.getItem('token');

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
                // Image upload logic
                const uploadResponse = await axios.post('http://localhost:8000/uploadfile/', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fileUrl = uploadResponse.data.url;
            } catch (error) {
                setStatusMessage('File upload failed.');
                return;
            }
        }

        try {
            // Shoutout post karne ka logic
            await axios.post('http://localhost:8000/shoutouts/', {
                message: message,
                tagged_users: taggedUsers,
                file_url: fileUrl
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStatusMessage('Shout-out sent successfully!');
            // Form clear kar dein
            setMessage('');
            setTaggedUsers('');
            setSelectedFile(null);
            // 3 second baad message hata dein
            setTimeout(() => setStatusMessage(''), 3000);
        } catch (error) {
            setStatusMessage('Failed to send shout-out.');
        }
    };
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // --- YAHAN CHANGE KIYA GAYA HAI ---
    // Humne Box wrapper ko hata diya hai aur Paper ko directly return kiya hai
    return (
        <Paper 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
                p: 3, 
                mb: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                maxWidth: 800,  // <-- Size ko thoda bada kar diya
                width: '100%',  // <-- Responsive rehne ke liye
                // margin: 'auto' ki zaroorat nahi, layout center kar raha hai
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom>
                Send a Shout-out
            </Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3} 
                label="Your shout-out message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                required 
            />
            <TextField 
                fullWidth 
                label="Tag users (e.g., user1@example.com)" 
                value={taggedUsers} 
                onChange={(e) => setTaggedUsers(e.target.value)} 
                required 
            />
            
            <Box>
                <Button variant="outlined" component="label" size="small">
                    Upload Image
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {selectedFile && <Typography sx={{ ml: 2, display: 'inline', fontStyle: 'italic' }}>{selectedFile.name}</Typography>}
            </Box>

            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Send Shout-out
            </Button>
            {/* Status message ab theme ke hisab se dikhega */}
            {statusMessage && <Typography sx={{ mt: 1, color: statusMessage.includes('failed') ? 'error.main' : 'success.main' }}>{statusMessage}</Typography>}
        </Paper>
    );
}

export default Shoutout;