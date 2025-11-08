// API service for BragBoard authentication
const API_BASE_URL = 'http://127.0.0.1:8000';

function extractErrorMessage(errorData, fallback = 'Request failed') {
  try {
    if (!errorData) return fallback;
    const detail = errorData.detail ?? errorData.message ?? errorData.error ?? errorData;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      // FastAPI validation errors come as an array of {loc,msg}
      const msgs = detail
        .map((d) => (typeof d === 'string' ? d : (d.msg || d.message || JSON.stringify(d))))
        .filter(Boolean);
      return msgs.join('; ') || fallback;
    }
    if (typeof detail === 'object') {
      if (detail.msg || detail.message) return detail.msg || detail.message;
      return JSON.stringify(detail);
    }
    return String(detail);
  } catch (_) {
    return fallback;
  }
}

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
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Registration failed');
        console.error('Registration error:', errorData);
        throw new Error(msg);
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
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Login failed');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during login');
    }
  }

  async searchUsers({ department = 'all', search = '' }) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE_URL}/shoutouts/users/search?${params.toString()}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to search users');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during user search');
    }
  }

  async createShoutOutMulti({ message, recipient_ids, is_public = 'public', image_url = null }) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const payload = { message, recipient_ids, is_public, image_url };

      const response = await fetch(`${API_BASE_URL}/shoutouts/create-multi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to create shout-out');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during shout-out creation');
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
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to fetch user profile');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during profile fetch');
    }
  }

  async getFeed({ department = 'all', sender = '', dateFrom = '', dateTo = '', skip = 0, limit = 100 }) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (sender) params.append('sender', sender);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/shoutouts/feed?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to fetch feed');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during feed fetch');
    }
  }

  async uploadImage(file) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

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
        const msg = extractErrorMessage(errorData, 'Failed to upload image');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during image upload');
    }
  }

  async deleteShoutOut(shoutoutId) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${shoutoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to delete shout-out');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during shout-out deletion');
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

  async addReaction(shoutoutId, reactionType) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${shoutoutId}/react?reaction_type=${encodeURIComponent(reactionType)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to add reaction');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during reaction');
    }
  }

  async getReactions(shoutoutId) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${shoutoutId}/reactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to get reactions');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during getting reactions');
    }
  }

  async addComment(shoutoutId, commentText) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${shoutoutId}/comments?comment_text=${encodeURIComponent(commentText)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to add comment');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during adding comment');
    }
  }

  async getComments(shoutoutId) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${shoutoutId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to get comments');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during getting comments');
    }
  }

  async deleteComment(commentId) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to delete comment');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during deleting comment');
    }
  }

  async getTopContributors(limit = 10) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/admin/analytics/top-contributors?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to get top contributors');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during getting top contributors');
    }
  }

  async getMostTagged(limit = 10) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/admin/analytics/most-tagged?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to get most tagged users');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during getting most tagged users');
    }
  }

  async reportShoutOut(shoutoutId, reason) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/${parseInt(shoutoutId)}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to report shout-out');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during reporting shout-out');
    }
  }

  async getReports(status = 'pending', skip = 0, limit = 50) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();
      params.append('status', status);
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/shoutouts/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to get reports');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during getting reports');
    }
  }

  async resolveReport(reportId) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/shoutouts/admin/reports/${parseInt(reportId)}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = extractErrorMessage(errorData, 'Failed to resolve report');
        throw new Error(msg);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error during resolving report');
    }
  }
}

export default new ApiService();
