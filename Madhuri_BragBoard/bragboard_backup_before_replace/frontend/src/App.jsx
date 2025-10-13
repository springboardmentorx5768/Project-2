import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './components/layout/Layout'
import { AuthProvider, useAuth } from './utils/AuthContext'
import RoleBasedRoute from './components/auth/RoleBasedRoute'
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Public Routes */}
          <Route 
            path="login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Achievement Routes */}
          <Route 
            path="achievements" 
            element={
              <ProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">🏆 All Achievements</h1>
                  <p className="text-secondary-600">Browse all achievements in your department!</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="achievements/my" 
            element={
              <ProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">🏆 My Achievements</h1>
                  <p className="text-secondary-600">View and manage your personal achievements!</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Team Management - Manager/Admin only */}
          <Route 
            path="team" 
            element={
              <RoleBasedRoute allowedRoles={['manager', 'admin']}>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">👥 Team Management</h1>
                  <p className="text-secondary-600">Manage your team members and their achievements!</p>
                </div>
              </RoleBasedRoute>
            } 
          />
          
          {/* Analytics - Manager/Admin only */}
          <Route 
            path="analytics" 
            element={
              <RoleBasedRoute allowedRoles={['manager', 'admin']}>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">📈 Department Analytics</h1>
                  <p className="text-secondary-600">View detailed analytics for your department!</p>
                </div>
              </RoleBasedRoute>
            } 
          />
          
          {/* Admin Routes - Admin only */}
          <Route 
            path="admin/users" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">👤 User Management</h1>
                  <p className="text-secondary-600">Manage all users in the system!</p>
                </div>
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="admin/departments" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">🏢 Department Management</h1>
                  <p className="text-secondary-600">Manage departments and organizational structure!</p>
                </div>
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="admin/settings" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">⚙️ System Settings</h1>
                  <p className="text-secondary-600">Configure system-wide settings!</p>
                </div>
              </RoleBasedRoute>
            } 
          />
          
          {/* Leaderboard - All authenticated users */}
          <Route 
            path="leaderboard" 
            element={
              <ProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-4">🥇 Leaderboard</h1>
                  <p className="text-secondary-600">See how you rank against your colleagues!</p>
                </div>
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App