import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MyShoutoutsPage from './pages/MyShoutoutsPage.jsx';
import DepartmentFeedPage from './pages/DepartmentFeedPage.jsx';
import CreateShoutoutPage from './pages/CreateShoutoutPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout onShoutoutCreated={() => { /* This ensures the callback exists */ }}>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-shoutouts" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MyShoutoutsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/department-feed" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DepartmentFeedPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-shoutout"
        element={
          <ProtectedRoute>
            <CreateShoutoutPage />
          </ProtectedRoute>
        }
      />
      {/* Add routes for /leaderboard, /profile, /settings here */}
    </Routes>
  );
}

export default App;