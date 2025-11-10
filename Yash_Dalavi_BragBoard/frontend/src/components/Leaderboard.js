import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Paper, List, ListItem, ListItemAvatar, 
    Avatar, ListItemText, CircularProgress 
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Trophy icon

// Leaderboard item ke liye helper component
function LeaderboardItem({ user, rank }) {
    // Rank ke hisab se color
    const getRankColor = (rank) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return 'primary.main'; // Baaki ranks
    };

    return (
        <ListItem divider>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: getRankColor(rank), color: 'white' }}>
                    <Typography fontWeight="bold">{rank}</Typography>
                </Avatar>
            </ListItemAvatar>
            <ListItemText 
                primary={<Typography fontWeight="500">{user.email}</Typography>}
                secondary={`${user.count} Shout-outs sent`}
            />
        </ListItem>
    );
}

// Yeh hamara main Leaderboard page hai
function Leaderboard() {
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const token = getToken();
            if (!token) {
                setError('You must be logged in to view this.');
                setLoading(false);
                return;
            }

            try {
                // Hum naya public endpoint call kar rahe hain
                const response = await axios.get('http://localhost:8000/leaderboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setContributors(response.data);
            } catch (err) {
                 setError('Could not load leaderboard.');
                console.error('Error fetching leaderboard stats:', err);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, []); // Yeh sirf ek baar chalega

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" variant="h5" align="center">{error}</Typography>;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 700, margin: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mr: 1 }}/>
                <Typography variant="h4" fontWeight="bold">Top Contributors</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Top 10 users who have sent the most shout-outs.
            </Typography>
            <List>
                {contributors.length > 0 ? contributors.map((user, index) => (
                    <LeaderboardItem key={index} user={user} rank={index + 1} />
                )) : (
                    <Typography>No data found. Start sending shout-outs!</Typography>
                )}
            </List>
        </Paper>
    );
}

export default Leaderboard;