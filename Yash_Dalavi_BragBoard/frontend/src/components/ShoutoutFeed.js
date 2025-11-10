import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Button, TextField, Box, Typography, Paper, List, ListItemText, Divider, 
    Card, CardHeader, CardContent, CardActions, CardMedia, Avatar, 
    ListItem, ListItemAvatar, Select, MenuItem, InputLabel, FormControl,
    IconButton, Tooltip, // <-- Tooltip IMPORT
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Snackbar, Alert // <-- NAYA IMPORT (Report notification ke liye)
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag'; // <-- NAYA ICON
import ReactionButtons from './ReactionButtons';

// Time helper function
function formatTimeAgo(dateString) {
    if (!dateString) return ''; 
    if (!dateString.endsWith('Z')) {
        dateString += 'Z';
    }
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return `1d ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
}

function ShoutoutFeed() {
    const [shoutouts, setShoutouts] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [currentUserRole, setCurrentUserRole] = useState('member');
    const [department, setDepartment] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [shoutoutToDelete, setShoutoutToDelete] = useState(null);

    // --- NAYA STATE (Report notification ke liye) ---
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    // ----------------------------------------------

    const getToken = () => localStorage.getItem('token');

    const fetchShoutouts = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const params = new URLSearchParams();
            if (department) params.append('department', department);
            if (senderEmail) params.append('sender_email', senderEmail);
            const response = await axios.get(`http://localhost:8000/shoutouts/`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params 
            });
            setShoutouts(response.data);
        } catch (error) {
            console.error('Error fetching shoutouts:', error);
        }
    }, [department, senderEmail]); 

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCurrentUserRole(response.data.role);
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };
        fetchUserRole();
        fetchShoutouts();
    }, [fetchShoutouts]); 

    const handleFilterClear = () => {
        setDepartment('');
        setSenderEmail('');
    };

    const handleCommentSubmit = async (shoutoutId) => {
        const commentText = commentInputs[shoutoutId] || '';
        if (!commentText) return;
        const token = getToken();
        try {
            await axios.post(`http://localhost:8000/shoutouts/${shoutoutId}/comments/`, { text: commentText }, { headers: { 'Authorization': `Bearer ${token}` } });
            setCommentInputs(prev => ({ ...prev, [shoutoutId]: '' }));
            fetchShoutouts(); 
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const postReaction = async (shoutoutId, reactionType) => {
        const token = getToken();
        try {
            await axios.post(
                `http://localhost:8000/shoutouts/${shoutoutId}/react`,
                { reaction_type: reactionType },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error posting reaction:", error);
        }
    };

    const handleReact = async (shoutoutId, reactionType) => {
        setShoutouts(prevShoutouts => 
            prevShoutouts.map(post => {
                if (post.id === shoutoutId) {
                    const currentReaction = post.current_user_reaction;
                    let newCounts = { ...post.reaction_counts } || { like: 0, clap: 0, star: 0 };
                    if (currentReaction && newCounts[currentReaction] > 0) {
                        newCounts[currentReaction]--;
                    }
                    if (currentReaction !== reactionType) {
                        newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
                        return { ...post, current_user_reaction: reactionType, reaction_counts: newCounts };
                    } else {
                        return { ...post, current_user_reaction: null, reaction_counts: newCounts };
                    }
                }
                return post;
            })
        );
        await postReaction(shoutoutId, reactionType);
    };

    const handleDeleteClick = (shoutoutId) => {
        setShoutoutToDelete(shoutoutId);
        setOpenDeleteDialog(true);
    };

    const handleDeleteClose = () => {
        setShoutoutToDelete(null);
        setOpenDeleteDialog(false);
    };

    const handleDeleteConfirm = async () => {
        if (!shoutoutToDelete) return;
        const token = getToken();
        try {
            await axios.delete(`http://localhost:8000/shoutouts/${shoutoutToDelete}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setToast({ open: true, message: 'Shout-out deleted successfully', severity: 'success' });
            fetchShoutouts(); 
        } catch (error) {
            console.error('Error deleting shoutout:', error);
            setToast({ open: true, message: 'Failed to delete shout-out', severity: 'error' });
        }
        handleDeleteClose(); 
    };

    // --- YEH NAYA FUNCTION ADD HUA HAI (WEEK 6 - REPORT) ---
    const handleReport = async (shoutoutId) => {
        const reason = prompt("Why are you reporting this post? (Optional)");
        // Agar user ne 'Cancel' dabaya, toh reason 'null' hoga
        if (reason === null) {
            return;
        }

        const token = getToken();
        try {
            await axios.post(
                `http://localhost:8000/shoutouts/${shoutoutId}/report`,
                { reason: reason }, // Report ka reason bhejo
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setToast({ open: true, message: 'Post reported to admin', severity: 'success' });
        } catch (error) {
            console.error("Error reporting post:", error);
            const errorMessage = error.response?.data?.detail || 'Failed to report post';
            setToast({ open: true, message: errorMessage, severity: 'error' });
        }
    };
    // --------------------------------------------------------

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto' }}>
            
            {/* --- FILTER UI --- */}
            <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ mr: 2, flexBasis: '100%' }}>Filters</Typography>
                <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1 }}>
                    <InputLabel id="dept-filter-label">Department</InputLabel>
                    <Select
                        labelId="dept-filter-label"
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <MenuItem value=""><em>All Departments</em></MenuItem>
                        <MenuItem value="general">General</MenuItem>
                        <MenuItem value="engineering">Engineering</MenuItem>
                        <MenuItem value="sales">Sales</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    label="Sender Email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    sx={{ minWidth: 180, flexGrow: 1 }}
                />
                <Button variant="outlined" onClick={handleFilterClear} sx={{ ml: 'auto' }}>
                    Clear
                </Button>
            </Paper>

            {/* --- RECENT SHOUT-OUTS FEED --- */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
                Recent Shout-outs
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {shoutouts.length > 0 ? shoutouts.map((shoutout) => (
                    <Card key={shoutout.id} sx={{ overflow: 'visible' }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {shoutout.author?.email ? shoutout.author.email[0].toUpperCase() : 'A'}
                                </Avatar>
                            }
                            action={
                                currentUserRole === 'admin' && (
                                    <IconButton 
                                        aria-label="delete" 
                                        onClick={() => handleDeleteClick(shoutout.id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )
                            }
                            title={<Typography fontWeight="600">{shoutout.author?.email || 'Unknown'}</Typography>}
                            subheader={`Tagged: ${shoutout.tagged_users} · ${formatTimeAgo(shoutout.created_at)}`}
                        />
                        
                        {shoutout.file_url && (
                            <CardMedia
                                component="img"
                                sx={{ maxHeight: 400, objectFit: 'contain', mb: 1, p: 2, backgroundColor: '#f9f9f9' }}
                                image={`http://localhost:8000${shoutout.file_url}`}
                                alt="shoutout attachment"
                            />
                        )}

                        <CardContent sx={{ pt: 0 }}>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                                "{shoutout.message}"
                            </Typography>
                        </CardContent>

                        {/* --- CARD ACTIONS UPDATE HUA HAI --- */}
                        <CardActions sx={{ px: 2, pb: 1, justifyContent: 'space-between' }}>
                            <ReactionButtons
                                shoutoutId={shoutout.id}
                                reactionCounts={shoutout.reaction_counts || { like: 0, clap: 0, star: 0 }}
                                currentUserReaction={shoutout.current_user_reaction}
                                onReact={handleReact}
                            />
                            
                            {/* --- NAYA REPORT BUTTON --- */}
                            <Tooltip title="Report this post">
                                <IconButton onClick={() => handleReport(shoutout.id)} size="small">
                                    <FlagIcon />
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                        {/* ---------------------------------- */}
                        
                        <Divider sx={{ mx: 2 }} />

                        {/* Comment Section */}
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Comments:</Typography>
                            <List dense sx={{ width: '100%', p: 0 }}>
                                {shoutout.comments.map((comment) => (
                                    <ListItem key={comment.id} sx={{ alignItems: 'flex-start' }}>
                                        <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'grey.300', color: 'black' }}>
                                                {comment.author?.email ? comment.author.email[0].toUpperCase() : 'U'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box component="span">
                                                    <Typography variant="body2" component="span" fontWeight="600" sx={{ mr: 0.5 }}>
                                                        {comment.author?.email || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTimeAgo(comment.created_at)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" component="span" color="text.secondary">
                                                    {comment.text}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            
                            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(shoutout.id); }} sx={{ display: 'flex', mt: 2, gap: 1 }}>
                                 <Avatar sx={{ width: 32, height: 32, mt: 0.5, bgcolor: 'primary.light' }} />
                                <TextField 
                                    size="small" 
                                    variant="outlined" 
                                    fullWidth 
                                    label="Write a comment..." 
                                    value={commentInputs[shoutout.id] || ''} 
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [shoutout.id]: e.target.value }))}
                                    sx={{ borderRadius: '20px', '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                                />
                                <Button type="submit" size="small" variant="contained" sx={{ borderRadius: '20px', px: 3 }}>Post</Button>
                            </Box>
                        </CardContent>
                    </Card>
                )) : (
                    <Paper sx={{p: 4, textAlign: 'center'}}>
                        <Typography variant="h6">No Shout-outs Found</Typography>
                        <Typography color="text.secondary">Try clearing the filters or wait for new shout-outs!</Typography>
                        <Button variant="outlined" onClick={handleFilterClear} sx={{ mt: 2 }}>
                            Clear Filters
                        </Button>
                    </Paper>
                )}
            </Box>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <Dialog open={openDeleteDialog} onClose={handleDeleteClose}>
                <DialogTitle>Delete Shout-out?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this shout-out? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* --- NAYA REPORT NOTIFICATION --- */}
            <Snackbar 
                open={toast.open} 
                autoHideDuration={6000} 
                onClose={() => setToast({...toast, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setToast({...toast, open: false})} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>

        </Box>
    );
}

export default ShoutoutFeed;