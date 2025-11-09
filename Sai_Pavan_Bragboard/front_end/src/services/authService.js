// Return JWT token stored in localStorage (safe getter for SSR environments)
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    return null;
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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

export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }
  return await response.json();
};

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