const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://backend-five-psi-21.vercel.app/api');


// Helper to make API requests with Authorization header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res.data;
    },
    register: async (name, email, password, role = 'developer') => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res.data;
    },
    getMe: async () => {
      return request('/auth/me');
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getCurrentUser: () => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }
  },

  // Projects
  projects: {
    getAll: async () => {
      const res = await request('/projects');
      return res.data || [];
    },
    getById: async (id) => {
      const res = await request(`/projects/${id}`);
      return res.data;
    },
    create: async (projectData) => {
      const res = await request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      return res.data;
    },
    update: async (id, projectData) => {
      const res = await request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
      });
      return res.data;
    },
    delete: async (id) => {
      const res = await request(`/projects/${id}`, {
        method: 'DELETE'
      });
      return res.data;
    }
  },

  // Tasks
  tasks: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/tasks${query ? `?${query}` : ''}`);
      return res.data || [];
    },
    getStats: async () => {
      const res = await request('/tasks/stats/summary');
      return res.data || { total: 0, completed: 0, inProgress: 0, todo: 0, completionRate: 0 };
    },
    create: async (taskData) => {
      const res = await request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      return res.data;
    },
    update: async (id, taskData) => {
      const res = await request(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData)
      });
      return res.data;
    },
    delete: async (id) => {
      const res = await request(`/tasks/${id}`, {
        method: 'DELETE'
      });
      return res.data;
    }
  },

  // AI Features
  ai: {
    generateTasks: async (prompt, project, autoInsert = false) => {
      const res = await request('/ai/generate-tasks', {
        method: 'POST',
        body: JSON.stringify({ prompt, project, autoInsert })
      });
      return res;
    },
    summarize: async () => {
      const res = await request('/ai/summarize', {
        method: 'POST'
      });
      return res.data;
    },
    projectDescription: async (name, category) => {
      const res = await request('/ai/project-description', {
        method: 'POST',
        body: JSON.stringify({ name, category })
      });
      return res.data;
    }
  }
};
