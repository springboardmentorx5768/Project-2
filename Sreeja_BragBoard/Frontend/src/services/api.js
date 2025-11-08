// API service for BragBoard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  // Helper method for authenticated requests
  async authenticatedRequest(endpoint, options = {}) {
    console.log(`Making authenticated request to ${endpoint}`);
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found in localStorage');
      throw new Error('No access token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log('Request headers:', headers);
    console.log('Request options:', options);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Request failed:', errorData);
        throw new Error(errorData?.detail || 'Request failed');
      }

      const data = await response.json();
      console.log(`Request to ${endpoint} successful:`, data);
      return data;
    } catch (error) {
      console.error(`Error making request to ${endpoint}:`, error);
      throw error;
    }
  }
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during registration');
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error during login');
    }
  }

  async logout() {
    localStorage.removeItem('access_token');
  }

  // User methods
  async getUserProfile() {
    return this.authenticatedRequest('/users/profile');
  }

  // Shoutout methods
  async uploadImage(file) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/shoutouts/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Image upload failed');
    }

    return await response.json();
  }

  async getShoutoutsFeed(filters = {}) {
    const { 
      department = 'all', 
      senderId = null, 
      startDate = null, 
      endDate = null,
      skip = 0, 
      limit = 100 
    } = filters;

    console.log('Getting shoutouts feed with filters:', filters);

    const params = new URLSearchParams({
      ...(department !== 'all' && { department }),
      ...(senderId && { sender_id: senderId.toString() }),
      ...(startDate && { start_date: startDate.toISOString() }),
      ...(endDate && { end_date: endDate.toISOString() }),
      skip: skip.toString(),
      limit: limit.toString(),
    });

    console.log('Request URL params:', params.toString());

    try {
      const data = await this.authenticatedRequest(`/shoutouts/feed?${params}`);
      console.log(`Retrieved ${data.length} shoutouts`);
      return data;
    } catch (error) {
      console.error('Failed to get shoutouts feed:', error);
      throw new Error('Failed to load shoutouts. Please check your connection and try again.');
    }
  }

  async createShoutout(shoutoutData) {
    // If there's a file to upload, handle it first
    if (shoutoutData.file) {
      const uploadResult = await this.uploadImage(shoutoutData.file);
      shoutoutData.image_url = uploadResult.image_url;
      delete shoutoutData.file;
    }

    return this.authenticatedRequest('/shoutouts/create', {
      method: 'POST',
      body: JSON.stringify(shoutoutData),
    });
  }

  async getMyShoutouts(type = 'all', skip = 0, limit = 100) {
    const params = new URLSearchParams({ type, skip: skip.toString(), limit: limit.toString() });
    return this.authenticatedRequest(`/shoutouts/my-shoutouts?${params}`);
  }

  async deleteShoutout(shoutoutId) {
    return this.authenticatedRequest(`/shoutouts/${shoutoutId}`, {
      method: 'DELETE',
    });
  }

  async getDepartmentStats() {
    return this.authenticatedRequest('/shoutouts/departments/stats');
  }

  async getMyStats() {
    return this.authenticatedRequest('/shoutouts/my-stats', {
      method: 'GET'
    });
  }

  async getLeaderboard(limit = 10) {
    return this.authenticatedRequest(`/shoutouts/leaderboard?limit=${limit}`);
  }

  async searchUsers(department = '', search = '') {
    const params = new URLSearchParams({
      ...(department && department !== 'all' && { department }),
      ...(search && { search }),
    });
    return this.authenticatedRequest(`/users/list?${params}`);
  }

  async getAllUsers() {
    return this.authenticatedRequest('/users/all');
  }

  async deleteUser(userId) {
    return this.authenticatedRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async deleteMyAccount() {
    return this.authenticatedRequest('/users/me/delete', {
      method: 'DELETE',
    });
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Cannot connect to server');
    }
  }

  // Activity Log methods
  async getActivityLog(limit = 100) {
    return this.authenticatedRequest(`/api/activity/logs?limit=${limit}`);
  }

  async logActivity(actionType, details = '') {
    return this.authenticatedRequest('/api/activity/log', {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, details }),
    });
  }

  // Get all shoutouts for analytics
  async getShoutouts() {
    return this.authenticatedRequest('/shoutouts/feed?limit=1000');
  }

  // Reaction methods
  async addReaction(shoutoutId, reactionType) {
    return this.authenticatedRequest('/reactions/', {
      method: 'POST',
      body: JSON.stringify({
        shoutout_id: shoutoutId,
        reaction_type: reactionType
      }),
    });
  }

  async removeReaction(shoutoutId) {
    return this.authenticatedRequest(`/reactions/${shoutoutId}`, {
      method: 'DELETE',
    });
  }

  async getReactionSummary(shoutoutId) {
    return this.authenticatedRequest(`/reactions/${shoutoutId}/summary`);
  }

  async getReactionUsers(shoutoutId) {
    return this.authenticatedRequest(`/reactions/${shoutoutId}/users`);
  }

  // Comment methods
  async addComment(shoutoutId, commentText) {
    return this.authenticatedRequest('/comments/', {
      method: 'POST',
      body: JSON.stringify({
        shoutout_id: shoutoutId,
        comment_text: commentText
      }),
    });
  }

  async getComments(shoutoutId) {
    return this.authenticatedRequest(`/comments/${shoutoutId}`);
  }

  async deleteComment(commentId) {
    return this.authenticatedRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }


}

export default new ApiService();