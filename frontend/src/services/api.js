const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getUsers: async (role, status) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/auth/users${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  approveUser: async (id, roleUpdate) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleUpdate || {}),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Events
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getEventById: async (id) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  generatePlan: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/generate-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  replanEvent: async (eventId, replanData) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/replan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(replanData),
    });
    return handleResponse(res);
  },

  resolveConflicts: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/resolve-conflicts`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  approvePlan: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/approve-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  rejectPlan: async (eventId, rejectionReason) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/reject-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectionReason }),
    });
    return handleResponse(res);
  },

  updatePlan: async (eventId, planData) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/plan`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  getEventVersions: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/versions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Tasks
  getTasks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getTaskById: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  updateTaskStatus: async (id, updateData) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Venues
  getVenues: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/venues${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createVenue: async (venueData) => {
    const res = await fetch(`${API_BASE}/venues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(venueData),
    });
    return handleResponse(res);
  },

  updateVenue: async (id, venueData) => {
    const res = await fetch(`${API_BASE}/venues/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(venueData),
    });
    return handleResponse(res);
  },

  // Resources
  getResources: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/resources${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createResource: async (resourceData) => {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });
    return handleResponse(res);
  },

  updateResource: async (id, resourceData) => {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
