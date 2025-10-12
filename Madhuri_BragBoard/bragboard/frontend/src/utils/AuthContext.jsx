import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { LoadingSpinner } from '../components/ui'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('access_token')
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      localStorage.setItem('access_token', response.access_token)
      
      // Set user from login response
      setUser(response.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      
      let errorMessage = 'Login failed'
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Handle FastAPI validation errors
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      localStorage.setItem('access_token', response.access_token)
      
      // Set user from register response
      setUser(response.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      
      let errorMessage = 'Registration failed'
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Handle FastAPI validation errors
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser({ ...user, ...userData })
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  const canAccessDepartment = (departmentId) => {
    if (user?.role === 'admin') return true
    if (user?.role === 'manager' && user?.department_id === departmentId) return true
    if (user?.department_id === departmentId) return true
    return false
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    canAccessDepartment,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading BragBoard...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}