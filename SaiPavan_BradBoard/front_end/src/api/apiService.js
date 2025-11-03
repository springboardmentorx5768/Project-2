import { getToken } from '../services/authService.js';

// Use the VITE_API_URL from your environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

export const loginUser = async (credentialsOrEmail, maybePassword) => {
  // Accept either: (email, password) OR ({ username, password })
  let params = new URLSearchParams();
  if (typeof credentialsOrEmail === 'string') {
    params.append('username', credentialsOrEmail);
    params.append('password', maybePassword || '');
  } else if (typeof credentialsOrEmail === 'object' && credentialsOrEmail !== null) {
    const user = credentialsOrEmail.username ?? credentialsOrEmail.email ?? credentialsOrEmail.emailAddress;
    const pwd = credentialsOrEmail.password ?? credentialsOrEmail.pass;
    params.append('username', user || '');
    params.append('password', pwd || '');
  } else {
    throw new Error('Invalid arguments to loginUser');
  }

  const response = await fetch(`${API_URL}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errMsg = (payload && (payload.detail || payload.message)) || 'Login failed';
    const err = new Error(errMsg);
    // Attach response-like shape for callers that inspect err.response
    err.response = { status: response.status, data: payload };
    throw err;
  }

  // Return axios-like object: { data: ... }
  return { data: payload };
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const responseData = await response.json().catch(() => null);
  
  if (!response.ok) {
    const errorMessage = responseData?.detail || responseData?.message || `Registration failed with status ${response.status}`;
    const error = new Error(errorMessage);
    // Attach response-like shape for callers that inspect err.response
    error.response = { status: response.status, data: responseData };
    throw error;
  }
  
  return responseData;
};

// --- ADD THIS NEW FUNCTION ---
export const getCurrentUserProfile = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return await response.json();
};

// Adapter for AuthContext which expects an axios-like response { data: ... }
export const getCurrentUser = async () => {
  const data = await getCurrentUserProfile();
  return { data };
};

// --- ADD THIS NEW FUNCTION ---
export const getShoutouts = async (filters = {}) => {
  const token = getToken();
  
  // Build query parameters from filters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/api/v1/shoutouts/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch shoutouts');
  }
  return await response.json();
};

// --- ADD NEW FILTER FUNCTIONS ---
export const getAvailableDepartments = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/filters/departments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }
  return await response.json();
};

export const getAvailableSenders = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/filters/senders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch senders');
  }
  return await response.json();
};

// --- ADD THIS NEW FUNCTION ---
export const getUsers = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return await response.json();
};
// ... (add these to your existing file)

export const createShoutout = async (shoutoutData) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(shoutoutData),
  });
  if (!response.ok) throw new Error('Failed to create shoutout');
  return await response.json();
};

// --- ADD FILE UPLOAD FUNCTION ---
export const uploadFile = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/v1/shoutouts/upload-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Failed to upload file');
  }
  
  return await response.json();
};

export const getMyShoutouts = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch your shoutouts');
  return await response.json();
};

export const getShoutoutsByDepartment = async (department) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/?department=${department}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch department shoutouts');
  return await response.json();
};

export const createComment = async (shoutoutId, commentData) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });
  if (!response.ok) throw new Error('Failed to post comment');
  return await response.json();
};

export const toggleReaction = async (shoutoutId, reaction) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(reaction),
  });
  if (!response.ok) throw new Error('Failed to toggle reaction');
  return await response.json();
};

export const getShoutoutReactions = async (shoutoutId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}/reactions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to get reactions');
  return await response.json();
};

export const deleteShoutout = async (shoutoutId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete shoutout');
  return await response.json();
};