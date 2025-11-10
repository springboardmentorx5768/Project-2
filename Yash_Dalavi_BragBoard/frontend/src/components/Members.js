import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, Alert 
} from '@mui/material';

function Members() {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Loading state add kiya

    useEffect(() => {
        const fetchMembers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to view this page.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8000/users/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMembers(response.data);
            } catch (err) {
                setError('You do not have permission to view this page.'); // Role-based error
                console.error('Error fetching members:', err);
            }
            setLoading(false); // Loading complete
        };

        fetchMembers();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        // Error ke liye MUI Alert component
        return (
            <Alert severity="error" sx={{ maxWidth: 700, margin: 'auto' }}>
                <Typography variant="h6">{error}</Typography>
            </Alert>
        );
    }

    return (
        // Poore table ko Paper component mein wrap kiya
        <TableContainer component={Paper} sx={{ maxWidth: 900, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ p: 2, fontWeight: 'bold' }}>
                App Members
            </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="members table">
                <TableHead>
                    {/* Header row ko theme color diya */}
                    <TableRow sx={{ '& th': { backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' } }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Active</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {members.map((member) => (
                        <TableRow
                            key={member.id}
                            sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                        >
                            <TableCell>{member.id}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{member.role}</TableCell>
                            <TableCell>{member.is_active ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Members;
