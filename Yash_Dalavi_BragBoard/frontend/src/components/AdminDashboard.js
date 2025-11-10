import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <-- NAYA IMPORT
import { 
    Box, Typography, Paper, Grid, List, ListItem, ListItemAvatar, 
    Avatar, ListItemText, CircularProgress, Button, Divider 
} from '@mui/material';
import { Person, Chat } from '@mui/icons-material';
import ReportIcon from '@mui/icons-material/Report';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // <-- NAYA ICON

// StatCard helper component
function StatCard({ title, value, icon, color }) {
    return (
        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h6" color="text.secondary">{title}</Typography>
                <Typography variant="h4" fontWeight="bold">{value}</Typography>
            </Box>
        </Paper>
    );
}

// Admin Dashboard page
function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('token');

    const fetchReports = async () => {
        const token = getToken();
        try {
            const response = await axios.get('http://localhost:8000/admin/reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReports(response.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            const token = getToken();
            if (!token) {
                setError('You must be logged in.');
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const [statsResponse, reportsResponse] = await Promise.all([
                    axios.get('http://localhost:8000/admin/stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/admin/reports', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                
                setStats(statsResponse.data);
                setReports(reportsResponse.data);

            } catch (err) {
                setError('You do not have permission to view this page.');
                console.error('Error fetching admin data:', err);
            }
            setLoading(false);
        };

        fetchAllData();
    }, []); 

    const handleResolveReport = async (reportId) => {
        const token = getToken();
        try {
            await axios.put(`http://localhost:8000/admin/reports/${reportId}/resolve`, 
                {}, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchReports(); 
        } catch (err) {
            console.error('Error resolving report:', err);
        }
    };

    // --- YEH NAYA FUNCTION ADD HUA HAI (WEEK 6 - CSV EXPORT) ---
    const handleExportShoutouts = async () => {
        const token = getToken();
        try {
            const response = await axios.get('http://localhost:8000/admin/export/shoutouts', {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob', // Yeh important hai file download ke liye
            });

            // Blob data se ek temporary URL banayein
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Ek temporary link banayein
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'shoutouts_export.csv'); // File ka naam
            
            // Link ko click karein (download trigger)
            document.body.appendChild(link);
            link.click();
            
            // Temporary link ko hata dein
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error exporting CSV:', err);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" variant="h5" align="center">{error}</Typography>;
    }

    if (!stats) {
        return <Typography variant="h5" align="center">No statistics found.</Typography>;
    }

    return (
        <Box>
            {/* --- HEADER AUR EXPORT BUTTON --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">Admin Dashboard</Typography>
                <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportShoutouts}
                >
                    Export Shout-outs (CSV)
                </Button>
            </Box>
            
            {/* Top Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Shout-outs" 
                        value={stats.total_shoutouts}
                        icon={<Chat />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Members" 
                        value={stats.total_members}
                        icon={<Person />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Pending Reports" 
                        value={reports.length}
                        icon={<ReportIcon />}
                        color="error.main"
                    />
                </Grid>
            </Grid>

            {/* Do Columns: Top Contributors aur Pending Reports */}
            <Grid container spacing={3}>
                {/* Column 1: Top Contributors */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h5" gutterBottom fontWeight="600">Top 5 Contributors</Typography>
                        <List>
                            {stats.top_contributors.length > 0 ? stats.top_contributors.map((user, index) => (
                                <ListItem key={index} divider>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                                            {index + 1}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={<Typography fontWeight="500">{user.email}</Typography>}
                                        secondary={`${user.count} Shout-outs sent`}
                                    />
                                </ListItem>
                            )) : (
                                <Typography>No data found.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Column 2: Pending Reports */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h5" gutterBottom fontWeight="600">Pending Reports</Typography>
                        <List>
                            {reports.length > 0 ? reports.map((report) => (
                                <ListItem key={report.id} divider sx={{ alignItems: 'flex-start' }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'error.light', color: 'white' }}>
                                            <ReportIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={
                                            <Typography fontWeight="500">
                                                Reported by: {report.reporter.email}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    Post: "{report.shoutout.message}"
                                                </Typography>
                                                <br />
                                                Reason: "{report.reason || 'No reason given'}"
                                            </>
                                        }
                                    />
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        onClick={() => handleResolveReport(report.id)}
                                        sx={{ ml: 2, mt: 1 }}
                                    >
                                        Resolve
                                    </Button>
                                </ListItem>
                            )) : (
                                <Typography>No pending reports. Good job!</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AdminDashboard;