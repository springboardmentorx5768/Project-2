import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) =>
    api.get('/users', { params }),
  
  getUser: (userId) =>
    api.get(`/users/${userId}`),
  
  updateUser: (userId, userData) =>
    api.put(`/users/${userId}`, userData),
  
  updatePassword: (userId, passwordData) =>
    api.put(`/users/${userId}/password`, passwordData),
  
  deleteUser: (userId) =>
    api.delete(`/users/${userId}`),
}

// Departments API
export const departmentsAPI = {
  getDepartments: (params = {}) =>
    api.get('/departments', { params }),
  
  getDepartment: (departmentId) =>
    api.get(`/departments/${departmentId}`),
  
  createDepartment: (departmentData) =>
    api.post('/departments', departmentData),
  
  updateDepartment: (departmentId, departmentData) =>
    api.put(`/departments/${departmentId}`, departmentData),
  
  deleteDepartment: (departmentId) =>
    api.delete(`/departments/${departmentId}`),
}

// Achievements API
export const achievementsAPI = {
  getAchievements: (params = {}) =>
    api.get('/achievements', { params }),
  
  getMyAchievements: (params = {}) =>
    api.get('/achievements/my', { params }),
  
  getAchievement: (achievementId) =>
    api.get(`/achievements/${achievementId}`),
  
  createAchievement: (achievementData) =>
    api.post('/achievements', achievementData),
  
  updateAchievement: (achievementId, achievementData) =>
    api.put(`/achievements/${achievementId}`, achievementData),
  
  deleteAchievement: (achievementId) =>
    api.delete(`/achievements/${achievementId}`),
  
  getMyStats: () =>
    api.get('/achievements/stats/my'),
  
  getDepartmentLeaderboard: (departmentId, limit = 10) =>
    api.get(`/achievements/leaderboard/${departmentId}`, { 
      params: { limit } 
    }),
}

export default api