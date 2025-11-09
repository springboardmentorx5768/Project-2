import { getToken } from '../services/authService.js';

// Use the VITE_API_URL from your environment or default to backend dev URL
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Expose for quick debugging in browser console
export const __API_URL__ = API_URL;

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
  // Inform caller about approval status if provided
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

// Fetch a single shoutout by ID (used for admin moderation previews)
export const getShoutout = async (shoutoutId) => {
  if (shoutoutId === undefined || shoutoutId === null) throw new Error('shoutoutId required');
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch shoutout');
  }
  return data;
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

// Profile-related API functions
export const updateUserProfile = async (profileData) => {
  const token = getToken();
  console.log('Sending profile update request:', profileData);
  
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  
  console.log('Profile update response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Profile update error response:', errorData);
    
    const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: Failed to update profile`;
    throw new Error(errorMessage);
  }
  
  const result = await response.json();
  console.log('Profile update successful:', result);
  return result;
};

export const getUserStats = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/me/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to get user stats');
  return await response.json();
};

// Settings-related API functions
export const getUserSettings = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/me/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: Failed to get user settings`;
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

export const updateUserSettings = async (settingsData) => {
  const token = getToken();
  console.log('Sending settings update request:', settingsData);
  
  const response = await fetch(`${API_URL}/api/v1/users/me/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settingsData),
  });
  
  console.log('Settings update response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Settings update error response:', errorData);
    
    const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: Failed to update settings`;
    throw new Error(errorMessage);
  }
  
  const result = await response.json();
  console.log('Settings update successful:', result);
  return result;
};

export const deleteUserAccount = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: Failed to delete account`;
    throw new Error(errorMessage);
  }
  
  // For 204 responses, there might not be any JSON content
  if (response.status === 204) {
    return { message: 'Account deleted successfully' };
  }
  
  return await response.json();
};

// Admin APIs
export const adminDeleteShoutout = async (shoutoutId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/shoutouts/${shoutoutId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete shoutout');
  return await response.json();
};

export const adminDeleteComment = async (commentId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete comment');
  return await response.json();
};

export const promoteUserToAdmin = async (userId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}/promote`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || 'Failed to promote user');
  }
  return await response.json();
};

export const demoteUserFromAdmin = async (userId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}/demote`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || 'Failed to demote user');
  }
  return await response.json();
};

export const adminDeleteUser = async (userId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}` , {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to delete user');
  }
  return data;
};

export const approveUser = async (userId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to approve user');
  }
  return data;
};

export const fetchPendingUsers = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/users/pending`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch pending users');
  }
  return data;
};

export const fetchAdminInsights = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/analytics/insights`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch insights');
  return await response.json();
};

// Lightweight connectivity & CORS diagnostic helper
export const debugPing = async () => {
  try {
    const res = await fetch(`${API_URL}/`);
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};

export const fetchLeaderboard = async (opts) => {
  const token = getToken();
  const url = new URL(`${API_URL}/api/v1/analytics/leaderboard`);
  let days, department;
  if (typeof opts === 'number') {
    days = opts;
  } else if (opts && typeof opts === 'object') {
    days = opts.days;
    department = opts.department;
  }
  if (typeof days === 'number' && days > 0) url.searchParams.set('days', String(days));
  if (department) url.searchParams.set('department', department);
  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return await response.json();
};

export const exportReportsCsv = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/reports/export`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to export reports');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reports.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Reporting APIs
export const reportShoutout = async (shoutoutId, reason) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/shoutouts/${shoutoutId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to report shoutout');
  }
  return data;
};

export const fetchReports = async (status) => {
  const token = getToken();
  const url = new URL(`${API_URL}/api/v1/admin/reports`);
  if (status) url.searchParams.set('status', status);
  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch reports');
  }
  return data;
};

export const resolveReport = async (reportId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to resolve report');
  }
  return data;
};

// Recognition APIs
export const setEmployeeOfMonth = async ({ user_id, department = null, month, year, note }) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_URL}/api/v1/recognition/employee-of-month`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id, department, month, year, note }),
    });
    const data = await response.json().catch(() => null);
      if (!response.ok) {
        const status = response.status;
        const serverMsg = data?.detail || data?.message;
        const help = status === 401 ? 'Please log in again.' : status === 403 ? 'Admin access required.' : '';
        if (status === 404) {
          throw new Error(serverMsg || 'Endpoint not found (404). Check backend route /recognition/employee-of-month');
        }
        if (status >= 500) {
          throw new Error('Server error: Please check backend logs.');
        }
        throw new Error(serverMsg || `Failed to set employee of month (HTTP ${status}). ${help}`.trim());
      }
    return data;
  } catch (e) {
    // Distinguish network errors
    if (e instanceof TypeError) {
      // TypeError from fetch usually indicates network/CORS issue
      throw new Error('Network error: Could not reach the server. Check backend is running at ' + API_URL);
    }
    throw e;
  }
};

export const fetchCurrentEmployeesOfMonth = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/recognition/employee-of-month/current`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch employees of month');
  }
  return data;
};

export const fetchEmployeesOfMonth = async (opts = {}) => {
  const token = getToken();
  const url = new URL(`${API_URL}/api/v1/recognition/employee-of-month`);
  const { month, year, department, limit, offset } = opts;
  if (month) url.searchParams.set('month', month);
  if (year) url.searchParams.set('year', year);
  if (department) url.searchParams.set('department', department);
  if (limit) url.searchParams.set('limit', limit);
  if (offset) url.searchParams.set('offset', offset);
  const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${token}` } });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch employee of month history');
  }
  return data;
};

export const fetchDepartments = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/departments`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch departments');
  }
  return data; // array of strings
};

export const getUserById = async (userId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to fetch user');
  }
  return data;
};

// Department admin role management
export const fetchDepartmentAdmins = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/department-admins`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch department admins');
  return data;
};

export const fetchMyDepartmentAdminRoles = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/department-admins/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch my department admin roles');
  return data;
};

export const assignDepartmentAdmin = async (userId, department) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/department-admins/${userId}/${encodeURIComponent(department)}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || 'Failed to assign department admin');
  return data;
};

export const revokeDepartmentAdmin = async (userId, department) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1/admin/department-admins/${userId}/${encodeURIComponent(department)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || 'Failed to revoke department admin');
  return data;
};