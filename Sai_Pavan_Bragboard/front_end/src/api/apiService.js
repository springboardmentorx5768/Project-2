import { getToken } from '../services/authService.js';

// Use the VITE_API_URL from your environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }
  return await response.json();
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
export const getShoutouts = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch shoutouts');
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

export const getMyShoutouts = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch your shoutouts');
  return await response.json();
};

// Delete a shoutout by id. Backend may return 204 No Content or JSON.
export const deleteShoutout = async (shoutoutId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Failed to delete shoutout');
  }
  if (response.status === 204) return {};
  return await response.json().catch(() => ({}));
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