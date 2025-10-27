import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import api from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await api.getUserProfile()
          setIsAuthenticated(true)
          setUser(userData)
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
