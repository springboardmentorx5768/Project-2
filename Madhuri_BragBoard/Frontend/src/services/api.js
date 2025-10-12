// API service for BragBoard authentication
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  async register(userData) {
    try {
      console.log('Attempting registration with data:', userData);
      console.log('API URL:', `${API_BASE_URL}/users/register`);
      
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      return result;
    } catch (error) {
      console.error('Registration fetch error:', error);
      throw new Error(error.message || 'Network error during registration');
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during login');
    }
  }

  async getUserProfile() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during profile fetch');
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Cannot connect to server');
    }
  }
}

export default new ApiService();