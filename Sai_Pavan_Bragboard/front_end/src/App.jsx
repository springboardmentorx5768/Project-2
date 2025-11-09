import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MyShoutoutsPage from './pages/MyShoutoutsPage.jsx';
import DepartmentFeedPage from './pages/DepartmentFeedPage.jsx';
import CreateShoutoutPage from './pages/CreateShoutoutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UserPublicProfilePage from './pages/UserPublicProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RecognitionHistoryPage from './pages/RecognitionHistoryPage.jsx';

function App() {
  return (
    <ErrorBoundary>
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
              <ErrorBoundary>
                <DashboardLayout onShoutoutCreated={() => { /* This ensures the callback exists */ }}>
                  <DashboardPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-shoutouts" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <MyShoutoutsPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department-feed" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <DepartmentFeedPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-shoutout"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <CreateShoutoutPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <UserPublicProfilePage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <LeaderboardPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recognition-history"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardLayout>
                  <RecognitionHistoryPage />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;