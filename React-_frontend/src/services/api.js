const API_BASE = '/api';

/**
 * Helper to make authenticated API requests.
 */
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  return fetch(`${API_BASE}${url}`, { ...options, headers });
};

/**
 * Register a new user.
 */
export const registerUser = async (username, email, password) => {
  const res = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.username?.[0] || data.error || 'Registration failed');
  // Store tokens
  localStorage.setItem('access_token', data.tokens.access);
  localStorage.setItem('refresh_token', data.tokens.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

/**
 * Login an existing user.
 */
export const loginUser = async (username, password) => {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  // Store tokens
  localStorage.setItem('access_token', data.tokens.access);
  localStorage.setItem('refresh_token', data.tokens.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

/**
 * Send a question to the backend and get AI response.
 */
export const askQuestion = async (questionText) => {
  const res = await authFetch('/ask-question/', {
    method: 'POST',
    body: JSON.stringify({ question: questionText }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    throw new Error('Failed to get response');
  }
  return res.json();
};

/**
 * Get authenticated user's question history.
 */
export const getQuestionHistory = async () => {
  const res = await authFetch('/questions/');
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
};

/**
 * Clear the user's chat history on the backend.
 */
export const clearHistory = async () => {
  const res = await authFetch('/questions/clear/', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
};

/**
 * Logout user and clear stored tokens.
 */
export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Check if the user is currently authenticated.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Get the current user's info.
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
